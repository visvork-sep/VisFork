import { SplitPageLayout } from "@primer/react";
import Configuration from "@Components/Configuration/Configuration";
import ApplicationBody from "@Components/ApplicationBody";

function DataComponents() {
    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <Configuration />
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody />
            </SplitPageLayout.Content>
        </>
    );
}

export default DataComponents;