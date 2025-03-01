import { CheckboxGroup, FormControl, Checkbox } from "@primer/react";
import { FORKTYPES } from "@Utils/Constants";


interface ForksTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
}

function ForksTypeFilterInput({ onChangeHandler }: ForksTypeFilterInputProps) {
    const checkBoxes = FORKTYPES.map((forkType) => (
        <FormControl key={forkType}>
            <FormControl.Label>{forkType}</FormControl.Label>
            <Checkbox value={forkType} />
        </FormControl>
    ));

    return (
        <CheckboxGroup required onChange={onChangeHandler}>
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
