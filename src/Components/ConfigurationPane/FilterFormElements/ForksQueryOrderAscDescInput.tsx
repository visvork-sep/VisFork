import { FormControl, Select } from "@primer/react";
import { InputError } from "@Types/FormErrors";
import { SORT_DIRECTION } from "@Utils/Constants";

interface ForksQueryOrderAscDescInputProps {
    onChangeHandler: (value: string) => void;
    selected: string;
    error: InputError | null;
};

const options = Object.values(SORT_DIRECTION).map((option) =>
    (<Select.Option value={option.value} key={option.label}>{option.label}</Select.Option>)
);

function ForksQueryOrderAscDescInput({ onChangeHandler, selected, error }: ForksQueryOrderAscDescInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)} value={selected}>
                {options}
            </Select>
            {error && <FormControl.Validation variant="error">{error.message}</FormControl.Validation>}
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
export type { ForksQueryOrderAscDescInputProps };

