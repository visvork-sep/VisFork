import { SplitPageLayout } from "@primer/react";
import ConfigurationPane from "@Components/ConfigurationPane/ConfigurationPane";
import ApplicationBody from "@Components/ApplicationBody";
import WordCloud from "@Components/Plots/WordCloud/WordCloud";
import { useFilteredData } from "@Hooks/useFilteredData";
import { ForkFilterService } from "@Filters/ForkFilterService";

const forkFilterService: ForkFilterService = new ForkFilterService();

function DataComponents() {
    const { onFiltersChange }= useFilteredData(forkFilterService);
    return (
        <>
            <SplitPageLayout.Pane resizable aria-label="Configuration Pane">
                <ConfigurationPane filterChangeHandler={onFiltersChange}/>
            </SplitPageLayout.Pane >
            <SplitPageLayout.Content aria-label="Content">
                <ApplicationBody />
                <WordCloud />
            </SplitPageLayout.Content>
        </>
    );
}

export default DataComponents;