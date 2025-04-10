import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";
import { OWNER_TYPES } from "@Utils/Constants";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
    error: InputError | null;
};

/**
* radioboxes for owner type filtering of forks
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
