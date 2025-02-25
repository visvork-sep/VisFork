import { FormControl, TextInput } from "@primer/react";
import { ChangeEvent } from "react";

type CommitsDateRangeFromInputValidation = "laterFromDateError" | "unknownError";

interface CommitsDateRangeFromInputProps {
    validation? : CommitsDateRangeFromInputValidation
    onChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
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
            <TextInput type="date" onChange={onChangeHandler}/>
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
