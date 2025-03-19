import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import { useFilteredData } from "@Hooks/useFilteredData";
import { ForkFilterService } from "@Filters/ForkFilterService";

const forkFilterService: ForkFilterService = new ForkFilterService();

function DataComponents() {
    const {filteredForks, commitData, onFiltersChange, setForkQueryState }= useFilteredData(forkFilterService);
    const updateQuery = () => {
        setForkQueryState((state) => ({
            ...state,
            owner: "torvalds",
            repo: "linux",
            range: { },
        }));
    };

    return (
        <>
            <button onClick={updateQuery}>Set Query</button>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane filterChangeHandler={onFiltersChange}/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody forks={filteredForks} commits={commitData} />
            </SplitPageLayout.Content>
        </>
    );
}

export default DataComponents;
