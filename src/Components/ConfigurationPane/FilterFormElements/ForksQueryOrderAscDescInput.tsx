import { FormControl, Select } from "@primer/react";
import { ChangeEvent } from "react";

interface ForksQueryOrderAscDescInputProps {
    onChangeHandler: (event: ChangeEvent<HTMLSelectElement>) => void;
}


function ForksQueryOrderAscDescInput({ onChangeHandler } : ForksQueryOrderAscDescInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select onChange={onChangeHandler}>
                <Select.Option value="ascending">Ascending</Select.Option>
                <Select.Option value="descending">Descending</Select.Option>
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
