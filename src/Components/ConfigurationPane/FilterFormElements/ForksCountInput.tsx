import { FormControl, TextInput } from "@primer/react";
import { MIN_QUERIABLE_FORKS, MAX_QUERIABLE_FORKS } from "@Utils/Constants";
import { ForksCountInputErrorsType } from "../../../Types/FormErrors";

interface ForksCountInputProps {
    error?: ForksCountInputErrorsType;
    onChangeHandler: (input: string) => void;
    value?: number;
};

function ForksCountInput({ error, onChangeHandler, value }: ForksCountInputProps) {
    return (
        <FormControl id="forksCount" required>
            <FormControl.Label>Forks</FormControl.Label>
            <FormControl.Caption>
                The number of forks to analyze
            </FormControl.Caption>
            <TextInput type="number" min={MIN_QUERIABLE_FORKS} max={MAX_QUERIABLE_FORKS}
                onChange={e => onChangeHandler(e.target.value)} value={value ?? ""} />
            {error &&
                <FormControl.Validation variant="error">
                    {error.message}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    ForksCountInput
};
export type { ForksCountInputProps };
