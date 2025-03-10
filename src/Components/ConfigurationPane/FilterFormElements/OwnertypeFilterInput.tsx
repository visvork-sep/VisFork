import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void
    checked: string[];
}

function OwnerTypeFilterInput({ onChangeHandler, checked }: OwnerTypeFilterInputProps) {
    return (
        <CheckboxGroup onChange={onChangeHandler}>
            <CheckboxGroup.Label>Included owners</CheckboxGroup.Label>
            <FormControl>
                <FormControl.Label>User</FormControl.Label>
                <Checkbox value="user" />
            </FormControl>
            <FormControl>
                <FormControl.Label>Organization</FormControl.Label>
                <Checkbox value="organization" />
            </FormControl>
        </CheckboxGroup>
    );
}

export {
    OwnerTypeFilterInput
};
