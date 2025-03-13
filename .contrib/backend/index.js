const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
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

=======
const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

// Load frontend and backend URLs from environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;

// Load GitHub OAuth credentials from environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const PORT = process.env.PORT;
if (!FRONTEND_URL || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing required environment variables: FRONTEND_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET");
    process.exit(1);
}
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3

// Initialize Express application
const app = express();

<<<<<<< HEAD
// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors({
    origin: FRONTEND_URL, //Allows requests from the frontend
    methods: ["GET", "POST"], //allows GET adn POST requests
    credentials: true, // Allow sending cookies with requests
=======
// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend
app.use(cors({
    origin: FRONTEND_URL,// Allow requests from the frontend URL
    methods: ["GET", "POST"], // Allow only GET and POST methods
    credentials: true, // Enable sending cookies with requests
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3
    allowedHeaders: ["Content-Type", "Authorization"] // Allow these headers in requests
}));

// Middleware to parse JSON request bodies
app.use(express.json());

<<<<<<< HEAD
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
=======
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
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

<<<<<<< HEAD
        //console.log("🔍 GitHub Token Response Data:", tokenResponse.data); 

        // Check if we actually received an access token
        if (!tokenResponse.data.access_token) {
            console.error("❌ GitHub OAuth Error: No access token received!", tokenResponse.data);
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }

        //assign the data to the variable 
        const accessToken = tokenResponse.data.access_token;
       //console.log("✅ GitHub Access Token Received:", accessToken);

        // Fetch user details from GitHub using the access token
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

       //console.log("✅ GitHub User Data Received:", userResponse.data);

        // Store user info in session
        req.session.accessToken = accessToken;
        req.session.user = userResponse.data;

       //console.log("🔁 Redirecting user back to frontend...");
        res.redirect(FRONTEND_URL);
    } catch (error) {
        console.error("❌ GitHub OAuth Error:", error.response?.data || error);
=======
        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            return res.status(500).json({ error: "Failed to get access token from GitHub" });
        }

        res.json({ accessToken }); // Return access token to frontend
    } catch (error) {
        console.error("GitHub OAuth Error:", error.response?.data || error);
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3
        res.status(500).json({ error: "Failed to authenticate with GitHub" });
    }
});

<<<<<<< HEAD
// Step 3: API to get logged-in user data (without exposing the token)
app.get("/auth/user", (req, res) => {
    // User not logged in
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ avatarUrl: req.session.user.avatar_url }); // Avatar ⇨ sending
   //console.log("🛫 Sending avatar data");
});

// Step 4: Logout and destroy session
app.post("/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    }); //Destroy session
   //console.log("🔑 User logged out session destroyed.");
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
=======
// Start the server and listen on port PORT :)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
>>>>>>> 4e41b8af2cd956ab86c47a6cb7b55e17192819d3
