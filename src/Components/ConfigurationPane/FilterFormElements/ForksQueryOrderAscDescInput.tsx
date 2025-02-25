import { FormControl, Select } from "@primer/react";

function ForksQueryOrderAscDescInput() {
    return (
        <FormControl>
            <FormControl.Label>Retrieval order</FormControl.Label>
            <FormControl.Caption>Order of fork retrieval</FormControl.Caption>
            <Select>
                <Select.Option value="ascending">Ascending</Select.Option>
                <Select.Option value="descending">Descending</Select.Option>
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderAscDescInput
};
