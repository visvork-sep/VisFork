import { FormControl, TextInput } from "@primer/react";

type CommitsDateRangeFromInputValidation = "laterFromDateError" | "unknownError";

interface CommitsDateRangeFromInputProps {
    validation? : CommitsDateRangeFromInputValidation
    onChangeHandler: (input: string) => void;
};

function CommitsDateRangeFromInput({ validation, onChangeHandler } : CommitsDateRangeFromInputProps) {
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
            <TextInput type="date" onChange={e => onChangeHandler(e.target.value)}/>
            {validationText && 
                <FormControl.Validation variant="error">
                    {validationText}
                </FormControl.Validation>
            }
        </FormControl> 
    );
}

export {
    CommitsDateRangeFromInput
};
export type { CommitsDateRangeFromInputValidation, CommitsDateRangeFromInputProps };
