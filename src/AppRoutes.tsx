import { Routes, Route } from "react-router-dom";
import { SplitPageLayout } from "@primer/react";
import AppHeader from "@Components/AppHeader";
import DataComponents from "@Components/DataComponents";
import GitHubCallback from "@Components/GitHubCallback";

function AppRoutes() {
    return (
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
        </Routes>
    );
}

export default AppRoutes;
