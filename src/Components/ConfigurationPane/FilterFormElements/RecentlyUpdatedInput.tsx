import { FormControl, TextInput } from "@primer/react";
import { RECENT_ACTIVITY_MIN_MONTHS, RECENT_ACTIVITY_MAX_MONTHS } from "@Utils/Constants";

type RecentlyUpdatedInputValidation = "outOfInputRange" | "unknownError";

interface RecentlyUpdatedInputProps {
    validation?: RecentlyUpdatedInputValidation
    onChangeHandler: (input: string) => void;
};

function RecentlyUpdatedInput({ validation, onChangeHandler }: RecentlyUpdatedInputProps) {
    let validationText;

    switch (validation) {
        case "outOfInputRange":
            validationText = `Can only check between ${RECENT_ACTIVITY_MIN_MONTHS} and ` +
                `${RECENT_ACTIVITY_MAX_MONTHS} months`;
            break;
        case "unknownError":
            validationText = "Unknown Error in field";
    }

    return (
        <FormControl>
            <FormControl.Label>Recently updated</FormControl.Label>
            <FormControl.Caption>Months since last update (max {RECENT_ACTIVITY_MAX_MONTHS})</FormControl.Caption>
            <TextInput type="number" min={RECENT_ACTIVITY_MIN_MONTHS} max={RECENT_ACTIVITY_MAX_MONTHS}
                onChange={(e) => onChangeHandler(e.target.value)} />
            {validationText &&
                <FormControl.Validation variant="error">
                    {validationText}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    RecentlyUpdatedInput
};
export type { RecentlyUpdatedInputProps, RecentlyUpdatedInputValidation };
