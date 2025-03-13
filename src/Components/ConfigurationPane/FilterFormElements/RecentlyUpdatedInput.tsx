import { FormControl, TextInput } from "@primer/react";
import { RECENT_ACTIVITY_MIN_MONTHS, RECENT_ACTIVITY_MAX_MONTHS } from "@Utils/Constants";
import { RecentlyUpdatedInputErrorsType } from "../../../Types/FormErrors";

interface RecentlyUpdatedInputProps {
    error?: RecentlyUpdatedInputErrorsType;
    onChangeHandler: (input: string) => void;
    value?: string;
};

function RecentlyUpdatedInput({ error, onChangeHandler, value }: RecentlyUpdatedInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Recently updated</FormControl.Label>
            <FormControl.Caption>Months since last update (max {RECENT_ACTIVITY_MAX_MONTHS})</FormControl.Caption>
            <TextInput type="number" min={RECENT_ACTIVITY_MIN_MONTHS} max={RECENT_ACTIVITY_MAX_MONTHS}
                onChange={(e) => onChangeHandler(e.target.value)} value={value ?? ""} />
            {error &&
                <FormControl.Validation variant="error">
                    {error.message}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    RecentlyUpdatedInput
};
export type { RecentlyUpdatedInputProps };
