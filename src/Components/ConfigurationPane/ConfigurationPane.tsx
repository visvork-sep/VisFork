import { Stack } from "@primer/react";
import FilterForm from "@Components/ConfigurationPane/FilterForm";
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
        </Stack>
    );
}

export default ConfigurationPane;
