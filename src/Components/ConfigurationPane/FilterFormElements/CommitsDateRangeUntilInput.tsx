import { FormControl, TextInput } from "@primer/react";
import { CommitsDateRangeUntilInputErrorsType } from "../../../Types/FormErrors";

interface CommitsDateRangeUntilInputProps {
    error?: CommitsDateRangeUntilInputErrorsType
    onChangeHandler: (input: string) => void
    value?: string;
};

function CommitsDateRangeUntilInput({ error, onChangeHandler, value }: CommitsDateRangeUntilInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Commits until</FormControl.Label>
            <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
            <TextInput type="date" onChange={e => onChangeHandler(e.target.value)} value={value ?? ""} />
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
