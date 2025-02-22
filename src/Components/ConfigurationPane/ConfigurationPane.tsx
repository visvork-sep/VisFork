/// TODO: Modularize it, nesting too deep.
import { Stack } from "@primer/react";
import { Pagehead } from "@primer/react/deprecated";
import FilterForm from "@Components/ConfigurationPane/FilterForm";
import FileButtons from "@Components/ConfigurationPane/FileButtons";

const fileButtons = FileButtons();

function ConfigurationPane() {
    const filterForm = FilterForm();

    return(
        <Stack gap="condensed">
            <Stack.Item>
                {filterForm}
            </Stack.Item> 

            <Pagehead>Import/Export</Pagehead>
            <Stack.Item>
                {fileButtons}
            </Stack.Item>             
        </Stack>
    );
}

export default ConfigurationPane;