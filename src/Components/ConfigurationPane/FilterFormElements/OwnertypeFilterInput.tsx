import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { OWNER_TYPES } from "@Utils/Constants";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
};

function OwnerTypeFilterInput({ onChangeHandler, checked }: OwnerTypeFilterInputProps) {
    const checkBoxes = Object.values(OWNER_TYPES).map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <CheckboxGroup onChange={onChangeHandler}>
            <CheckboxGroup.Label>Included owners</CheckboxGroup.Label>
            {checkBoxes}
        </CheckboxGroup>
    );
}

export {
    OwnerTypeFilterInput
};
export type { OwnerTypeFilterInputProps };
