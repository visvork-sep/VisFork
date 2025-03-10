import { FormControl, TextInput } from "@primer/react";

type RepositoryInputValidation = "syntaxError" | "ownerError" | "repositoryNameError" | "unknownError";

interface RepositoryInputProps {
    validation?: RepositoryInputValidation;
    onChangeHandler: (input: string) => void;
    value: string
}

function RepositoryInput({ validation, onChangeHandler, value }: RepositoryInputProps) {
    let validationText: string | undefined;

    switch (validation) {
        case "syntaxError":
            validationText = "Syntax must match <Owner>/<RepositoryName>";
            break;
        case "ownerError":
            validationText = "Invalid repository owner";
            break;
        case "repositoryNameError":
            validationText = "Invalid repository name";
            break;
        case "unknownError":
            validationText = "Unknown error in field";
    }

    return (
        <FormControl required id="repository">
            <FormControl.Label>Repository</FormControl.Label>
            <TextInput type="text" placeholder="torvalds/linux" name="repository"
                onChange={e => onChangeHandler(e.target.value)} value={value} />
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
