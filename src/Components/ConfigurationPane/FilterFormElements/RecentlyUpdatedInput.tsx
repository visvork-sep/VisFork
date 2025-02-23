import { FormControl, TextInput } from "@primer/react";


const MOST_RECENT_UPDATE = 1;
const LEAST_RECENT_UPDATE = 12;

type RecentlyUpdatedInputValidation = "outOfInputRange";

interface RecentlyUpdatedInputProps {
    validation?: RecentlyUpdatedInputValidation
};

function RecentlyUpdatedInput({ validation } : RecentlyUpdatedInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Recently Updated</FormControl.Label>
            <FormControl.Caption>Months since latest update</FormControl.Caption>
            <TextInput type="number" min={MOST_RECENT_UPDATE} max={LEAST_RECENT_UPDATE}></TextInput>
            {validation &&
                <FormControl.Validation variant="error">
                    Input must be between {MOST_RECENT_UPDATE} and {LEAST_RECENT_UPDATE}.
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    RecentlyUpdatedInput
};
export type { RecentlyUpdatedInputProps, RecentlyUpdatedInputValidation };