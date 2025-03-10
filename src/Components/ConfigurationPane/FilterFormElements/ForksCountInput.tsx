import { FormControl, TextInput } from "@primer/react";
import { MIN_QUERIABLE_FORKS, MAX_QUERIABLE_FORKS } from "@Utils/Constants";

type ForksCountInputValidation = "lessThanMinForksError" | "greaterThanMaxForksError" | "unknownError";

interface ForksCountInputProps {
    validation?: ForksCountInputValidation;
    onChangeHandler: (input: string) => void;
    value: number
};

function ForksCountInput({ validation, onChangeHandler, value }: ForksCountInputProps) {
    let validationText: string | undefined;

    switch (validation) {
        case "lessThanMinForksError":
            validationText = "Number of forks must be greater than" + { MIN_FORKS: MIN_QUERIABLE_FORKS };
            break;
        case "greaterThanMaxForksError":
            validationText = "Number of forks must be less than" + { MAX_FORKS: MAX_QUERIABLE_FORKS };
            break;
        case "unknownError":
            validationText = "Unknown error in field";
    }

    return (
        <FormControl id="forksCount">
            <FormControl.Label>Forks</FormControl.Label>
            <FormControl.Caption>
                The number of forks to analyze
            </FormControl.Caption>
            <TextInput type="number" placeholder="5" min={MIN_QUERIABLE_FORKS} max={MAX_QUERIABLE_FORKS}
                onChange={e => onChangeHandler(e.target.value)} value={value} />
            {validationText &&
                <FormControl.Validation variant="error">
                    {validationText}
                </FormControl.Validation>
            }
        </FormControl>
    );
}

export {
    ForksCountInput
};
export type { ForksCountInputValidation, ForksCountInputProps };
