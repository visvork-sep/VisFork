import { FormControl, TextInput } from "@primer/react";
import { RECENT_ACTIVITY_MIN_MONTHS, RECENT_ACTIVITY_MAX_MONTHS } from "@Utils/Constants";
import { InputError } from "@Types/UIFormErrors";

interface RecentlyUpdatedInputProps {
    error: InputError | null;
    onChangeHandler: (input: string) => void;
    value: string;
};

/**
* Component that allows the user to input a number of months.
* It takes in a value and an onChange handler as props.
* It also takes in an error prop to display validation errors.
* The number of months is used to filter forks based on their recent activity.
*/
function RecentlyUpdatedInput({ error, onChangeHandler, value }: RecentlyUpdatedInputProps) {
    return (
        <FormControl>
            <FormControl.Label>Recently updated</FormControl.Label>
            <FormControl.Caption>
                Display only forks that are updated in recent months (at most {RECENT_ACTIVITY_MAX_MONTHS} ago)
            </FormControl.Caption>
            <TextInput type="number" min={RECENT_ACTIVITY_MIN_MONTHS} max={RECENT_ACTIVITY_MAX_MONTHS}
                onChange={(e) => onChangeHandler(e.target.value)} value={value} />
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
