import { Stack } from "@primer/react";
import FilterForm from "@Components/ConfigurationPane/FilterForm";
import { FilterChangeHandler } from "@Hooks/useFilteredData";

/**
 * Props for the ConfigurationPane component.
 */
interface ConfigurationPaneProps {
    filterChangeHandler: FilterChangeHandler;
    isDataLoading: boolean;
};

/**
 * Component that renders the configuration pane for the application.
 */
function ConfigurationPane({ filterChangeHandler, isDataLoading }: ConfigurationPaneProps) {
    return (
        <Stack gap="condensed">
            <Stack.Item>
                <FilterForm filterChangeHandler={filterChangeHandler} isDataLoading={isDataLoading} />
            </Stack.Item>
        </Stack>
    );
}

export default ConfigurationPane;
