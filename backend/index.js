import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        res.json({ user: userResponse.data, token: accessToken }); //Use this to test token return
        
    } catch (error) {
        console.error("GitHub OAuth Error:", error);
        res.status(500).json({ error: "Failed to authenticate" });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
