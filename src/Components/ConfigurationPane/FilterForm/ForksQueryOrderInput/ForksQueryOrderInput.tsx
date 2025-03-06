import { FormControl, Select } from "@primer/react";
import { FORKSORDER_OPTIONS } from "@Utils/Constants";
import { useMemo } from "react";

interface ForksQueryOrderInputProps {
    onChangeHandler: (value: string) => void;
}

function ForksQueryOrderInput({ onChangeHandler }: ForksQueryOrderInputProps) {
    const selectOptions = useMemo(() => FORKSORDER_OPTIONS.map(
        (option) => (<Select.Option value={option} key={option}>{option}</Select.Option>)
    ), [FORKSORDER_OPTIONS]);

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
