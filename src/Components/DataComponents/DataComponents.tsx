import { SplitPageLayout } from "@primer/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody/ApplicationBody";

const queryClient = new QueryClient();

function DataComponents() {

  

    return (
        <QueryClientProvider client={queryClient}>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody/>
            </SplitPageLayout.Content>
        </QueryClientProvider>
    );
}

export default DataComponents;
