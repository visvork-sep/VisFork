import { FormControl, TextInput } from "@primer/react";
import { MOST_RECENT_UPDATE, LEAST_RECENT_UPDATE } from "@Utils/Constants";

type RecentlyUpdatedInputValidation = "outOfInputRange" | "unknownError";

interface RecentlyUpdatedInputProps {
    validation?: RecentlyUpdatedInputValidation
};

function RecentlyUpdatedInput({ validation } : RecentlyUpdatedInputProps) {
    let validationText;
    
    switch (validation) {
        case "outOfInputRange":
            validationText = `Can only check between${LEAST_RECENT_UPDATE} and ${MOST_RECENT_UPDATE} months`;
            break;
        case "unknownError":
            validationText = `Unknown Error in field`;
    }
    
    return (
        <FormControl>
            <FormControl.Label>Recently Updated</FormControl.Label>
            <FormControl.Caption>Months since latest update (max {LEAST_RECENT_UPDATE})</FormControl.Caption>
            <TextInput type="number" min={MOST_RECENT_UPDATE} max={LEAST_RECENT_UPDATE}></TextInput>
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