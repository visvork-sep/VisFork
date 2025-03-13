import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";

function DataComponents() {
    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody />
            </SplitPageLayout.Content>
        </>
    );
}

export default DataComponents;
