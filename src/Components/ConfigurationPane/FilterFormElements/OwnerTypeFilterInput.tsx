import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { InputError } from "@Types/FormErrors";
import { OWNER_TYPES } from "@Utils/Constants";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
    error: InputError | null;
};

function OwnerTypeFilterInput({ onChangeHandler, checked, error }: OwnerTypeFilterInputProps) {
    const checkBoxes = Object.values(OWNER_TYPES).map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <FormControl>
            <CheckboxGroup onChange={onChangeHandler}>
                <CheckboxGroup.Label>Included owners</CheckboxGroup.Label>
                {checkBoxes}
            </CheckboxGroup>
            {error && <FormControl.Validation variant="error">Error message</FormControl.Validation>}
        </FormControl>
    );
}

export {
    OwnerTypeFilterInput
};
export type { OwnerTypeFilterInputProps };
