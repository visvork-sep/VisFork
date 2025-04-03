import { Stack } from "@primer/react";
import FilterForm from "@Components/ConfigurationPane/FilterForm";
import { FilterChangeHandler } from "@Hooks/useFilteredData";

interface ConfigurationPaneProps {
    filterChangeHandler: FilterChangeHandler;
};

function ConfigurationPane({ filterChangeHandler }: ConfigurationPaneProps) {
    return (
        <Stack gap="condensed">
            <Stack.Item>
                <FilterForm filterChangeHandler={filterChangeHandler} />
            </Stack.Item>
        </Stack>
    );
}

export default ConfigurationPane;
