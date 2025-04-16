import { FormControl, Select } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";
import { FORKS_SORTING_ORDERS } from "@Utils/Constants";

interface ForksQueryOrderInputProps {
    onChangeHandler: (value: string) => void;
    selected: string;
    error: InputError | null;
};

const options = Object.values(FORKS_SORTING_ORDERS).map((option) =>
    (<Select.Option value={option.value} key={option.value}>{option.label}</Select.Option>)
);


/**
 * Component that allows the user to select the sorting order of forks.
 * It takes in a value and an onChange handler as props.
 * It also takes in an error prop to display validation errors.
 */
function ForksQueryOrderInput({ onChangeHandler, selected, error }: ForksQueryOrderInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Top forks by</FormControl.Label>
            <FormControl.Caption>Metric to select the forks by in descending order</FormControl.Caption>
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
