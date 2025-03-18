import { FormControl, Select } from "@primer/react";
import { InputError } from "@Types/FormErrors";
import { FORKS_SORTING_ORDERS } from "@Utils/Constants";

interface ForksQueryOrderInputProps {
    onChangeHandler: (value: string) => void;
    selected: string;
    error: InputError | null;
};

const options = Object.values(FORKS_SORTING_ORDERS).map((option) =>
    (<Select.Option value={option.value} key={option.value}>{option.label}</Select.Option>)
);

function ForksQueryOrderInput({ onChangeHandler, selected, error }: ForksQueryOrderInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Select forks by</FormControl.Label>
            <FormControl.Caption>The metric to select forks by</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)} value={selected}>
                {options}
            </Select>
            {error && <FormControl.Validation variant="error">{error.message}</FormControl.Validation>}
        </FormControl>
    );
}

export {
    ForksQueryOrderInput
};
export type { ForksQueryOrderInputProps };
