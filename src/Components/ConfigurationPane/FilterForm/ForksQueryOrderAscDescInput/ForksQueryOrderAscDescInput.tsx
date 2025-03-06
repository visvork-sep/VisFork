import { FormControl, Select } from "@primer/react";
import { FORKSASCDESC } from "@Utils/Constants";
import { useMemo } from "react";

interface ForksQueryOrderAscDescInputProps {
    onChangeHandler: (value: string) => void;
}

function ForksQueryOrderAscDescInput({ onChangeHandler }: ForksQueryOrderAscDescInputProps) {

    const options = useMemo(() => FORKSASCDESC.map(
        (option) => (<Select.Option key={option} value={option}>{option}</Select.Option>)
    ), [FORKSASCDESC]);

    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)}>
                {options}
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
