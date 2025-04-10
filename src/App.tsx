import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import GitHubCallback from "@Components/GitHubCallback/GitHubCallback";
import HomePage from "@Components/HomePage/HomePage";

/**
 * The main application file responsible for defining top-level routes.
 * It uses React Router's BrowserRouter to manage navigation.
 */
function App() {
    return (
        /**
        * Sets up the root router, enabling navigation between pages.
        */
        <Router>
            <Routes>
                {/*
                    The HomePage component renders by default at the root path "/".
                */}
                <Route path="/" element={<HomePage />} />
                {/*
                    The GitHubCallback route handles OAuth redirects from GitHub.
                */}
                <Route path="/github/callback" element={<GitHubCallback />} />
            </Routes>
        </Router>
    );
}

export default App;
