import { FormControl, TextInput } from "@primer/react";

type CommitDateRangeUntilInputValidation = "laterFromDateError" | "futureUntilDateError" | "unknownError";

interface CommitDateRangeUntilInputProps {
    validation? : CommitDateRangeUntilInputValidation
};

function CommitsDateRangeUntilInput({ validation } : CommitDateRangeUntilInputProps) {
    let validationText;

    switch(validation) {
        case "laterFromDateError":
            validationText = "Not a valid date range";
            break;
        case "futureUntilDateError":
            validationText = "Future dates are now allowed for the until field";
            break;        
        case "unknownError":
            validationText = "Unknown commit date range error";
    }

    return (
        <FormControl>
            <FormControl.Label>Commits until</FormControl.Label>
            <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
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
    CommitsDateRangeUntilInput
};
export type {CommitDateRangeUntilInputProps, CommitDateRangeUntilInputValidation};
