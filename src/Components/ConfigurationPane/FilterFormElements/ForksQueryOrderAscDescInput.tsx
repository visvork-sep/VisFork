import { FormControl, Select } from "@primer/react";

interface ForksQueryOrderAscDescInputProps {
    onChangeHandler: (value: string) => void;
}


function ForksQueryOrderAscDescInput({ onChangeHandler } : ForksQueryOrderAscDescInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)}>
                <Select.Option value="ascending">Ascending</Select.Option>
                <Select.Option value="descending">Descending</Select.Option>
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
