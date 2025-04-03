import { Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import FilterForm from "@Components/ConfigurationPane/FilterForm";
import FileButtons from "@Components/ConfigurationPane/FileButtons";
import { FilterChangeHandler } from "@Hooks/useFilteredData";

interface ConfigurationPaneProps {
    filterChangeHandler: FilterChangeHandler;
    isDataLoading: boolean;
};

function ConfigurationPane({ filterChangeHandler, isDataLoading }: ConfigurationPaneProps) {
    console.log("Config pane", isDataLoading);

    return (
        <Stack gap="condensed">
            <Stack.Item>
                <FilterForm filterChangeHandler={filterChangeHandler} isDataLoading={isDataLoading} />
            </Stack.Item>

            <Pagehead>Import/Export</Pagehead>
            <Stack.Item>
                <FileButtons />
            </Stack.Item>
        </Stack>
    );
}

export default ConfigurationPane;
