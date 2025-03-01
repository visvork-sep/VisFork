import { Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import FilterForm from "@Components/ConfigurationPane/FilterForm/FilterForm";
import FileButtons from "@Components/ConfigurationPane/FileButtons/FileButtons";

function ConfigurationPane() {
    return (
        <Stack gap="condensed">
            <Stack.Item>
                <FilterForm />
            </Stack.Item>

            <Pagehead>Import/Export</Pagehead>
            <Stack.Item>
                <FileButtons />
            </Stack.Item>
        </Stack>
    );
}

export default ConfigurationPane;
