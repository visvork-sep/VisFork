const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const session = require("express-session");

dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" }
}));


const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Step 1: Redirect users to GitHub login
app.get("/auth/github", (req, res) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=http://localhost:5000/auth/github/callback&scope=read:user`;
    res.redirect(redirectUri);
});

// Step 2: Handle GitHub callback and exchange code for token
app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
        console.error("❌ GitHub OAuth Error: No code received");
        return res.status(400).json({ error: "No code provided" });
    }

    console.log("✅ GitHub OAuth Code Received:", code); // Debugging

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        console.log("🔍 GitHub Token Response Data:", tokenResponse.data); // Debugging

        // Check if we actually received an access token
        if (!tokenResponse.data.access_token) {
            console.error("❌ GitHub OAuth Error: No access token received!", tokenResponse.data);
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }

        const accessToken = tokenResponse.data.access_token;
        console.log("✅ GitHub Access Token Received:", accessToken);

        // Fetch user details from GitHub using the access token
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log("✅ GitHub User Data Received:", userResponse.data);

        // Store user info in session
        req.session.accessToken = accessToken;
        req.session.user = userResponse.data;

        console.log("🔁 Redirecting user back to frontend...");
        res.redirect("http://localhost:3000");
    } catch (error) {
        console.error("❌ GitHub OAuth Error:", error.response?.data || error);
        res.status(500).json({ error: "Failed to authenticate with GitHub" });
    }
});

// Step 3: API to get logged-in user data (without exposing the token)
app.get("/auth/user", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.session.user); // Only send user data
});

// Step 4: Logout and destroy session
app.post("/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});