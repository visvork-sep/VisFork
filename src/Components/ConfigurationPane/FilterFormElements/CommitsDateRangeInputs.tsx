import { FormControl, Stack, TextInput } from "@primer/react";

function CommitDateRangeInputs() {
    return (
        <Stack direction="horizontal" wrap="wrap">
            <Stack.Item>
                <FormControl>
                    <FormControl.Label>Commits from</FormControl.Label>
                    <FormControl.Caption>Retrieve commits starting from</FormControl.Caption>
                    <TextInput type="date"/>
                </FormControl> 
            </Stack.Item>
            <Stack.Item>
                <FormControl>
                    <FormControl.Label>Commits until</FormControl.Label>
                    <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
                    <TextInput type="date"/>
                </FormControl>
            </Stack.Item>
        </Stack>
    );
}

export {
    CommitDateRangeInputs
};