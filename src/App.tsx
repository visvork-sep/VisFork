import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SplitPageLayout } from "@primer/react";
import AppHeader from "@Components/AppHeader";
import DataComponents from "@Components/DataComponents";
import GitHubCallback from "@Components/GitHubCallback";
import GitHubLogout from "@Components/GitHubLogout";

/**
 * Root Application Component
 * 
 * This component initializes the router and renders all application routes.
 */
function App() {
    //Sending data to AppHeader below
    return (
        <Router>
            <Routes>
                {/* Default route */}
                <Route path="/" element={
                    <SplitPageLayout>
                        <SplitPageLayout.Header aria-label="Header">
                            <AppHeader />
                        </SplitPageLayout.Header>
                        <DataComponents />
                        <SplitPageLayout.Footer aria-label="Footer">
                            <div>Footer</div>
                        </SplitPageLayout.Footer>
                    </SplitPageLayout>
                } />

                {/* GitHub OAuth callback handler */}
                <Route path="/github/callback" element={<GitHubCallback />} />
                {/* GitHub OAuth logout handler */}
                <Route path="/github/logout" element={<GitHubLogout />} />
            </Routes>
        </Router>
    );
}

export default App;
