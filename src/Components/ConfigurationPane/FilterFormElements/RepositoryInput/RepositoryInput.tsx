import { FormControl, TextInput } from "@primer/react";
import { InputError } from "@Types/UIFormErrors";

interface RepositoryInputProps {
    error: InputError | null;
    onChangeHandler: (input: string) => void;
    value: string;
};

/**
* Component that allows the user to input a repository name.
* It takes in a value and an onChange handler as props.
* It also takes in an error prop to display validation errors.
*/
function RepositoryInput({ error, onChangeHandler, value }: RepositoryInputProps) {
    return (
        <FormControl required id="repository">
            <FormControl.Label>Repository</FormControl.Label>
            <TextInput type="text" placeholder="torvalds/linux" name="repository"
                onChange={e => onChangeHandler(e.target.value)} value={value} />
            <FormControl.Caption>
                This is the repository that the visualizations will be based upon
            </FormControl.Caption>
            {error &&
                <FormControl.Validation variant="error">
                    {error.message}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    RepositoryInput
};
export type { RepositoryInputProps };
