import { FormControl, TextInput } from "@primer/react";

type CommitDateRangeFromInputValidation = "laterFromDateError" | "unknownError";

interface CommitDateRangeFromInputProps {
    validation? : CommitDateRangeFromInputValidation
};

function CommitDateRangeFromInput({ validation } : CommitDateRangeFromInputProps) {
    let validationText;

    switch (validation) {
        case "laterFromDateError":
            validationText = "Not a valid date range";
            break;
        case "unknownError":
            validationText = "Unknown commit date range error";
    }

    return (
        <FormControl>
            <FormControl.Label>Commits from</FormControl.Label>
            <FormControl.Caption>Retrieve commits starting from</FormControl.Caption>
            <TextInput type="date"/>
            {validationText && 
                <FormControl.Validation variant="error">
                    {validationText}
                </FormControl.Validation>
            }
        </FormControl> 
    );
}

export {
    CommitDateRangeFromInput
};
export type { CommitDateRangeFromInputValidation, CommitDateRangeFromInputProps };
