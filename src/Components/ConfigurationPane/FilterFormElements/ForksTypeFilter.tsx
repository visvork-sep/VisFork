import { CheckboxGroup, FormControl, Checkbox } from "@primer/react";
import { FORK_TYPES } from "@Utils/Constants";

interface ForksTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void
    checked: string[]
}

function ForksTypeFilterInput({ onChangeHandler, checked }: ForksTypeFilterInputProps) {
    const checkBoxes = [
        FORK_TYPES.ADAPTIVE,
        FORK_TYPES.CORRECTIVE,
        FORK_TYPES.PERFECTIVE
    ].map(t => (
        <FormControl key={t.value}>
            <FormControl.Label>{t.label}</FormControl.Label>
            <Checkbox value={t.value} checked={checked.includes(t.value)} />
        </FormControl>
    ));

    return (
        <CheckboxGroup onChange={onChangeHandler} >
            <CheckboxGroup.Label>Included forks</CheckboxGroup.Label>
            <CheckboxGroup.Caption>Fork types to include into visualizations</CheckboxGroup.Caption>
            {checkBoxes}
        </CheckboxGroup>
    );
}

export {
    ForksTypeFilterInput
};
export type { ForksTypeFilterInputProps };
