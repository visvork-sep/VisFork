import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";

function DataComponents() {
    const { onFiltersChange, forks, commits, data  }= useFilteredData();

    console.log(JSON.stringify(data));
    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane filterChangeHandler={onFiltersChange}/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody />
            </SplitPageLayout.Content>
        </>
    );
}

export default DataComponents;
