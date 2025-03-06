import { FormControl, Select } from "@primer/react";
import { FORKSORDER_OPTIONS } from "@Utils/Constants";

interface ForksQueryOrderInputProps {
    onChangeHandler: (value: string) => void;
}

function ForksQueryOrderInput({ onChangeHandler }: ForksQueryOrderInputProps) {
    const selectOptions = FORKSORDER_OPTIONS.map((option) => (
        <Select.Option value={option} key={option}>{option}</Select.Option>
    ));

    return (
        <FormControl>
            <FormControl.Label>Select forks by</FormControl.Label>
            <FormControl.Caption>The metric to select forks by</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)}>
                {selectOptions}
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderInput
};
export type { ForksQueryOrderInputProps };
