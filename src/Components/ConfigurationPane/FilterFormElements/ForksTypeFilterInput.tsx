import { CheckboxGroup, FormControl, Checkbox } from "@primer/react";
import { InputError } from "@Types/FormErrors";
import { FORK_TYPES } from "@Utils/Constants";

interface ForksTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
    checked: string[];
    error: InputError | null;
};

function ForksTypeFilterInput({ onChangeHandler, checked, error }: ForksTypeFilterInputProps) {
    const checkBoxes = Object.values(FORK_TYPES).map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <FormControl>
            <CheckboxGroup onChange={onChangeHandler} >
                <CheckboxGroup.Label>Included forks</CheckboxGroup.Label>
                <CheckboxGroup.Caption>Fork types to include into visualizations</CheckboxGroup.Caption>
                {checkBoxes}
            </CheckboxGroup>
            {error && <FormControl.Validation variant="error">{error.message}</FormControl.Validation>}
        </FormControl>
    );
}

export {
    ForksTypeFilterInput
};
export type { ForksTypeFilterInputProps };
