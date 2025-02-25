import { FormControl, Stack, TextInput } from "@primer/react";

type CommitDateRangeInputsValidation = "laterFromDateError" | "futureUntilDateError" | "unknownError";

interface CommitDateRangeInputsProps {
    validation? : CommitDateRangeInputsValidation
};

function CommitDateRangeInputs({ validation } : CommitDateRangeInputsProps) {
    let validationTextFrom;
    let validationTextUntil;


    switch (validation) {
        case "laterFromDateError":
            validationTextFrom = "Not a valid date range";
            validationTextUntil = "Not a valid date range";
            break;
        case "futureUntilDateError":
            validationTextUntil = "Future dates are now allowed for the until field";
            break;        
        case "unknownError":
            validationTextFrom = "Unknown commit date range error";
            validationTextUntil = "Unknown commit date range error";
    }

    return (
        <Stack direction="horizontal" wrap="wrap">
            <Stack.Item>
                <FormControl>
                    <FormControl.Label>Commits from</FormControl.Label>
                    <FormControl.Caption>Retrieve commits starting from</FormControl.Caption>
                    <TextInput type="date"/>
                    {validationTextFrom && 
                        <FormControl.Validation variant="error">
                            {validationTextFrom}
                        </FormControl.Validation>
                    }
                </FormControl> 
            </Stack.Item>
            <Stack.Item>
                <FormControl>
                    <FormControl.Label>Commits until</FormControl.Label>
                    <FormControl.Caption>Retrieve commits up until </FormControl.Caption>
                    <TextInput type="date"/>
                    {validationTextUntil && 
                        <FormControl.Validation variant="error">
                            {validationTextUntil}
                        </FormControl.Validation>
                    }
                </FormControl>
            </Stack.Item>
        </Stack>
    );
}

export {
    CommitDateRangeInputs
};
export type { CommitDateRangeInputsValidation, CommitDateRangeInputsProps };
