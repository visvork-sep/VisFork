import AppHeader from "./Components/AppHeader";
import DataComponents from "@Components/DataComponents";
import { SplitPageLayout } from "@primer/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GitHubCallback from "./Components/GitHubCallback"; // Import the new component

function App() {
    //Sending data to AppHeader below
    return (
        <>
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
                </Routes>
            </Router>
        </>

    );
}

export default App;
