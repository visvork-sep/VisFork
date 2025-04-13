import { CheckboxGroup, FormControl, Checkbox } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";
import { COMMIT_TYPES } from "@Utils/Constants";

interface CommitTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
    error: InputError | null;
};

/**
* Radioboxes for filtering on commit types
*/
function CommitTypeFilterInput({ onChangeHandler, checked, error }: CommitTypeFilterInputProps) {
    const checkBoxes = Object.values(COMMIT_TYPES).map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <CheckboxGroup onChange={onChangeHandler} >
            <CheckboxGroup.Label>Included commits</CheckboxGroup.Label>
            <CheckboxGroup.Caption>Commit types to include in the visualizations</CheckboxGroup.Caption>
            {checkBoxes}
            {error && <CheckboxGroup.Validation variant="error">{error.message}</CheckboxGroup.Validation>}
        </CheckboxGroup>

    );
}

export {
    CommitTypeFilterInput
};
export type { CommitTypeFilterInputProps };
