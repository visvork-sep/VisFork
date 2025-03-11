import { FormControl, Select } from "@primer/react";
import { SORT_DIRECTION } from "@Utils/Constants";

interface ForksQueryOrderAscDescInputProps {
    onChangeHandler: (value: string) => void;
    selected: string;
};

const options = Object.values(SORT_DIRECTION).map((option) =>
    (<Select.Option value={option.value} key={option.label}>{option.label}</Select.Option>)
);

function ForksQueryOrderAscDescInput({ onChangeHandler, selected }: ForksQueryOrderAscDescInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)} value={selected}>
                {options}
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
export type { ForksQueryOrderAscDescInputProps };

