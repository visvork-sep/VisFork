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
 * Redirects users to GitHub's OAuth login page.
 */
app.get("/auth/github", (req, res) => {
    // Construct GitHub OAuth login URL with required parameters
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${BACKEND_URL}/auth/github/callback&scope=read:user`;
    res.redirect(redirectUri); // Redirect user to GitHub login page
});

/**
 * Step 2: Handle GitHub callback and exchange code for an access token
 * Endpoint: GET /auth/github/callback
 * Handles the callback from GitHub, exchanges authorization code for access token,
 * and redirects the user to the frontend with the token.
 */
app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query; // Extract authorization code from URL

    // If no code is provided, return an error response
    if (!code) {
        console.error("❌ GitHub OAuth Error: No code received");
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

        // Extract the access token from the response
        const accessToken = tokenResponse.data.access_token;
        
        // If no access token is received, return an error
        if (!accessToken) {
            console.error("❌ GitHub OAuth Error: No access token received!", tokenResponse.data);
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }
        
        // Destroy session immediately after login to avoid session persistence
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
        });
        
        // Redirect user to frontend with access token as a query parameter
        res.redirect(`${FRONTEND_URL}/?token=${accessToken}`);
        
    } catch (error) {
        console.error("❌ GitHub OAuth Error:", error.response?.data || error);
        res.status(500).json({ error: "Failed to authenticate with GitHub" });
    }
});

/**
 * Step 3: Fetch logged-in user data from GitHub
 * Endpoint: GET /auth/user
 * Retrieves user information from GitHub API using the provided token.
 */
app.get("/auth/user", async (req, res) => {
    const authHeader = req.headers.authorization; // Extract authorization header
    if (!authHeader) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    
    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    try {
        // Fetch user details from GitHub API
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        // Return user's avatar URL and token
        res.json({
            avatarUrl: userResponse.data.avatar_url,
            token: token // Optionally send back the token
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

/**
 * Step 4: Logout and destroy session
 * Endpoint: POST /auth/logout
 * Logs the user out and destroys the session.
 */
app.post("/auth/logout", (req, res) => {    
    res.json({ message: "Logged out" });
});

// Start the server and listen on port 5000
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
