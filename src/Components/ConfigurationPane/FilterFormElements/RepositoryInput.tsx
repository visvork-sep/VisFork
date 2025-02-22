import { FormControl, TextInput } from "@primer/react";

type RepositoryInputError = "syntax" | "owner" | "name";

interface RepositoryInputProps {
    error?: RepositoryInputError;
}

function RepositoryInput({ error } : RepositoryInputProps) {
    let validationText: string | undefined;

    switch(error) {
        case "syntax":
            validationText = "Syntax must match <Owner>/<RepositoryName>"
            break
        case "owner":
            validationText = "Invalid repository owner"
            break
        case "name":
            validationText = "Invalid repository name"
    }

    return (
        <FormControl required id="repository">
            <FormControl.Label>Repository</FormControl.Label>
            <TextInput type="text" placeholder="torvalds/linux" name="repository"/>
            <FormControl.Caption>
                This is the repository that the visualizations will be based upon
            </FormControl.Caption>
            {validationText && 
                <FormControl.Validation variant="error">
                    {validationText}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    RepositoryInput
};
export type { RepositoryInputProps, RepositoryInputError };
