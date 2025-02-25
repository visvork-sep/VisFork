const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const session = require("express-session");

//Load environment variables from .env file
dotenv.config();

// Load Frontend and backend url-s from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
// Load GitHub OAuth credentials from environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;


// Initialize Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors({
    origin: FRONTEND_URL, //Allows requests from the frontend
    methods: ["GET", "POST"], //allows GET adn POST requests
    credentials: true, // Allow sending cookies with requests
    allowedHeaders: ["Content-Type", "Authorization"] // Allow these headers in requests
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Set up session handling (store user authentication state)
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey", // Secret key for session encryption
    resave: false, // Don't save session if it hasn't changed
    saveUninitialized: false, // Don't create sessions for unauthenticated users
    cookie: { secure: false, httpOnly: true, sameSite: "lax" } // Cookie settings
}));

// Step 1: Redirect users to GitHub login
app.get("/auth/github", (req, res) => {
    //console.log("🔁 Redirecting user to GitHub login");
    // Construct GitHub OAuth login URL with required parameters
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${BACKEND_URL}/auth/github/callback&scope=read:user`;
    res.redirect(redirectUri); // Redirect user to GitHub login
});

// Step 2: Handle GitHub callback and exchange code for token
app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query; // Extract authorization code from URL

    // If no code is provided, return an error response
    if (!code) {
        console.error("❌ GitHub OAuth Error: No code received");
        return res.status(400).json({ error: "No code provided" });
    }

    //console.log("✅ GitHub OAuth Code Received:", code);

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        //assign the data to the variable 
        const accessToken = tokenResponse.data.access_token;
        // Check if we actually received an access token
        if (!accessToken) {
            console.error("❌ GitHub OAuth Error: No access token received!", tokenResponse.data);
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }
 
        // End the session immediately after login.
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
        });
        res.redirect(`${FRONTEND_URL}/?token=${accessToken}`);
        
    } catch (error) {
        console.error("❌ GitHub OAuth Error:", error.response?.data || error);
        res.status(500).json({ error: "Failed to authenticate with GitHub" });
    }
});

// Step 3: API to get logged-in user data (without exposing the token)
app.get("/auth/user", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    const token = authHeader.split(" ")[1]; // expecting "Bearer <token>"
    try {
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        res.json({
            avatarUrl: userResponse.data.avatar_url,
            token: token // Optionally send it back
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});


// Step 4: Logout and destroy session
app.post("/auth/logout", (req, res) => {    
    res.json({ message: "Logged out" });
   //console.log("🔑 User logged out session destroyed.");
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});