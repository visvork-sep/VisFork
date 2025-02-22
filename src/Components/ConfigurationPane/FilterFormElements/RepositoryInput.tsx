import { FormControl, TextInput } from "@primer/react";

type RepositoryInputValidation = "syntaxError" | "ownerError" | "repositoryNameError";

interface RepositoryInputProps {
    validation?: RepositoryInputValidation;
}

function RepositoryInput({ validation } : RepositoryInputProps) {
    let validationText: string | undefined;

    switch(validation) {
        case "syntaxError":
            validationText = "Syntax must match <Owner>/<RepositoryName>";
            break;
        case "ownerError":
            validationText = "Invalid repository owner";
            break;
        case "repositoryNameError":
            validationText = "Invalid repository name";
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
export type { RepositoryInputProps, RepositoryInputValidation };
