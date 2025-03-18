import { FormControl, TextInput } from "@primer/react";
import { InputError } from "../../../Types/FormErrors";


interface CommitsDateRangeFromInputProps {
    error: InputError | null;
    onChangeHandler: (input: string) => void;
    value: string;
};

function CommitsDateRangeFromInput({ error, onChangeHandler, value }: CommitsDateRangeFromInputProps) {
    return (
        <FormControl required>
            <FormControl.Label>Commits from</FormControl.Label>
            <FormControl.Caption>Retrieve commits starting from</FormControl.Caption>
            <TextInput type="date" onChange={e => onChangeHandler(e.target.value)} value={value}/>
            {error &&
                <FormControl.Validation variant="error">
                    {error.message}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    CommitsDateRangeFromInput
};
export type { CommitsDateRangeFromInputProps };
