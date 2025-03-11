const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

// Load frontend and backend URLs from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;

// Load GitHub OAuth credentials from environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!FRONTEND_URL || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("env not set");
    return;
}

// Initialize Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend
app.use(cors({
    origin: FRONTEND_URL,// Allow requests from the frontend URL
    methods: ["GET", "POST"], // Allow only GET and POST methods
    credentials: true, // Enable sending cookies with requests
    allowedHeaders: ["Content-Type", "Authorization"] // Allow these headers in requests
}));

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * Step 1: Redirect users to GitHub login
 * Endpoint: GET /auth/github
 * Redirects users to GitHub OAuth login page.
 */
app.get("/auth/github", (req, res) => {
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${FRONTEND_URL}/github/callback&scope=read:user`;
    res.redirect(redirectUri);
});

/**
 * Step 2: Exchange code for access tok en (called by frontend)
 * Endpoint: GET /auth/github/token
 * Accepts the authorization code from the frontend, exchanges it for an access token,
 * and returns the token to the frontend for further authentication.
 */
app.get("/auth/github/token", async (req, res) => {
    const { code } = req.query;
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

// Start the server and listen on port 5000
app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log("Server running on http://localhost:4000");
});
