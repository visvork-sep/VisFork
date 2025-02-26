import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { ChangeEvent } from "react";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[], event?: ChangeEvent<HTMLInputElement>) => void;
}

function OwnerTypeFilterInput({ onChangeHandler } : OwnerTypeFilterInputProps) {
    return (
        <CheckboxGroup onChange={onChangeHandler}>
            <CheckboxGroup.Label>Included Owners</CheckboxGroup.Label>
            <FormControl>
                <FormControl.Label>User</FormControl.Label>
                <Checkbox value="user"/>
            </FormControl>
            <FormControl>
                <FormControl.Label>Organization</FormControl.Label>
                <Checkbox value="organization"/>
            </FormControl>
        </CheckboxGroup>
    );
}

export {
    OwnerTypeFilterInput
};
