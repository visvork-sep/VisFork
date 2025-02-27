import AppHeader from "@Components/AppHeader";
import ApplicationBody from "@Components/ApplicationBody";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import { SplitPageLayout } from "@primer/react";

function App() {
    return (
        <SplitPageLayout>
            <SplitPageLayout.Header aria-label="Header">
                <AppHeader />
            </SplitPageLayout.Header>

            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane />
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody />
            </SplitPageLayout.Content>

            <SplitPageLayout.Footer aria-label="Footer">
                <div>Footer</div>
            </SplitPageLayout.Footer>
        </SplitPageLayout>
    );
}

export default App;
