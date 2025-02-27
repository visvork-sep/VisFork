import { FormControl, TextInput } from "@primer/react";

type CommitsDateRangeUntilInputValidation = "laterFromDateError" | "futureUntilDateError" | "unknownError";

interface CommitsDateRangeUntilInputProps {
    validation?: CommitsDateRangeUntilInputValidation
    onChangeHandler: (input: string) => void;
};

function CommitsDateRangeUntilInput({ validation, onChangeHandler }: CommitsDateRangeUntilInputProps) {
    let validationText;

    switch (validation) {
        case "laterFromDateError":
            validationText = "Not a valid date range";
            break;
        case "futureUntilDateError":
            validationText = "Future dates are not allowed for the until field";
            break;
        case "unknownError":
            validationText = "Unknown commit date range error";
    }

    return (
        <FormControl>
            <FormControl.Label>Commits until</FormControl.Label>
            <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
            <TextInput type="date" onChange={e => onChangeHandler(e.target.value)} />
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
export type { CommitsDateRangeUntilInputProps, CommitsDateRangeUntilInputValidation };
