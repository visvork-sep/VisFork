import { FormControl, Select } from "@primer/react";
import { FORKS_SORTING_ORDERS } from "@Utils/Constants";

interface ForksQueryOrderInputProps {
    onChangeHandler: (value: string) => void
    selected: string;
}

const options = [
    FORKS_SORTING_ORDERS.STARGAZERS,
    FORKS_SORTING_ORDERS.AUTHOR_STARS,
    FORKS_SORTING_ORDERS.DATE,
    FORKS_SORTING_ORDERS.LAST_COMMIT,
    FORKS_SORTING_ORDERS.WATCHERS
].map((option) =>
    (<Select.Option value={option.value} key={option.label}>{option.label}</Select.Option>)
);

function ForksQueryOrderInput({ onChangeHandler, selected }: ForksQueryOrderInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Select forks by</FormControl.Label>
            <FormControl.Caption>The metric to select forks by</FormControl.Caption>
            <Select onChange={e => onChangeHandler(e.target.value)} value={selected}>
                {options}
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderInput
};
export type { ForksQueryOrderInputProps };
