import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";
import { OWNER_TYPES } from "@Utils/Constants";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
    error: InputError | null;
};

/**
* Component that allows the user to select the owner types of forks to include in the visualization by radioboxes.
* It takes in a list of owner types and an onChange handler as props.
* It also takes in an error prop to display validation errors.
*/
function OwnerTypeFilterInput({ onChangeHandler, checked, error }: OwnerTypeFilterInputProps) {
    const checkBoxes = Object.values(OWNER_TYPES).map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <CheckboxGroup onChange={onChangeHandler}>
            <CheckboxGroup.Label>Included owners</CheckboxGroup.Label>
            <CheckboxGroup.Caption>Filter forks based on their owner type</CheckboxGroup.Caption>
            {checkBoxes}
            {error && <CheckboxGroup.Validation variant="error">{error.message}</CheckboxGroup.Validation>}
        </CheckboxGroup>

    );
}

export {
    OwnerTypeFilterInput
};
export type { OwnerTypeFilterInputProps };
