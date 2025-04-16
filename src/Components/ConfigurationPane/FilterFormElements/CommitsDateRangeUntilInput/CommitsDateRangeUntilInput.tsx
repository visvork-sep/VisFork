import { FormControl, TextInput } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";

interface CommitsDateRangeUntilInputProps {
    error: InputError | null;
    onChangeHandler: (input: string) => void;
    value: string;
};

/**
* Component that allows the user to input the end date for commits.
* It takes in a value and an onChange handler as props.
* It also takes in an error prop to display validation errors.
* The date is used to filter forks based on their commit history.
*/
function CommitsDateRangeUntilInput({ error, onChangeHandler, value }: CommitsDateRangeUntilInputProps) {
    return (
        <FormControl required>
            <FormControl.Label>Commits until</FormControl.Label>
            <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
            <TextInput type="date" onChange={e => onChangeHandler(e.target.value)} value={value} />
            {error &&
                <FormControl.Validation variant="error">
                    {error.message}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    CommitsDateRangeUntilInput
};
export type { CommitsDateRangeUntilInputProps };
