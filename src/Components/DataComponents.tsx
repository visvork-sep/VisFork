import { SplitPageLayout } from "@primer/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Configuration from "@Components/Configuration/Configuration";
import ApplicationBody from "@Components/ApplicationBody";

const queryClient = new QueryClient();

function DataComponents() {

  

    return (
        <QueryClientProvider client={queryClient}>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <Configuration/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody/>
            </SplitPageLayout.Content>
        </QueryClientProvider>
    );
}

export default DataComponents;