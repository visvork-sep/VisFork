import { FormControl, Select } from "@primer/react";
import { ChangeEvent } from "react";

interface ForksQueryOrderInputProps {
    onChangeHandler: (event: ChangeEvent<HTMLSelectElement>) => void;
}

function ForksQueryOrderInput({ onChangeHandler } : ForksQueryOrderInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Select forks by</FormControl.Label>
            <FormControl.Caption>The metric to select forks by</FormControl.Caption>
            <Select onChange={onChangeHandler}>
                <Select.Option value="stargazers">Starsgazers</Select.Option>
                <Select.Option value="date">Date of creation</Select.Option>
                <Select.Option value="watchers">Watchers</Select.Option>
                <Select.Option value="last commit">Date of Last Commit</Select.Option>
                <Select.Option value="author">Author followers</Select.Option> 
                {/* find out if possible */}
            </Select>
        </FormControl>
    );
}

export {
    ForksQueryOrderInput
};
export type {ForksQueryOrderInputProps};
