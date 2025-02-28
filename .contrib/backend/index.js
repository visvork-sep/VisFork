const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const session = require("express-session");

// Load environment variables from .env file
dotenv.config();

// Load frontend and backend URLs from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

// Load GitHub OAuth credentials from environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Initialize Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend
app.use(cors({
    origin: FRONTEND_URL, // Allow requests from the frontend URL
    methods: ["GET", "POST"], // Allow only GET and POST methods
    credentials: true, // Enable sending cookies with requests
    allowedHeaders: ["Content-Type", "Authorization"] // Allow these headers in requests
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Set up session handling to manage user authentication state
app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey", // Secret key for session encryption
    resave: false, // Do not save session if it has not changed
    saveUninitialized: false, // Do not create sessions for unauthenticated users
    cookie: { secure: false, httpOnly: true, sameSite: "lax" } // Cookie settings
}));

/**
 * Step 1: Redirect users to GitHub login
 * Endpoint: GET /auth/github
 * Redirects users to GitHub OAuth login page.
 */
app.get("/auth/github", (req, res) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${FRONTEND_URL}/auth/github/callback&scope=read:user`;
    res.redirect(redirectUri);
});

/**
 * Step 2: Exchange code for access token (called by frontend)
 * Endpoint: POST /auth/github/token
 * Accepts the authorization code from the frontend, exchanges it for an access token,
 * and returns the token to the frontend for further authentication.
 */
app.post("/auth/github/token", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }

        res.json({ accessToken }); // Return access token to frontend
    } catch (error) {
        console.error("GitHub OAuth Error:", error.response?.data || error);
        res.status(500).json({ error: "Failed to authenticate with GitHub" });
    }
});

/**
 * Step 3: Fetch GitHub user data using access token
 * Endpoint: POST /auth/user
 * Retrieves user details from GitHub API using the provided access token.
 */
app.post("/auth/user", async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: "No access token provided" });
    }

    try {
        // Query GitHub API for user details
        const githubResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const { login, id, avatar_url, name } = githubResponse.data;

        res.json({ login, id, avatarUrl: avatar_url, name }); // Return user data
    } catch (error) {
        console.error("GitHub API error:", error.response?.data || error);
        res.status(500).json({ error: "Failed to fetch user data from GitHub" });
    }
});


// Start the server and listen on port 5000
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
