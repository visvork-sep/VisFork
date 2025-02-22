import { FormControl, TextInput } from "@primer/react";
import { MIN_FORKS, MAX_FORKS } from "@Constants";


type ForksCountInputValidation = "LessThanMinForksError" | "GreaterThanMaxForksError";

interface ForksCountInputProps {
    validation?: ForksCountInputValidation
};

function ForksCountInput({ validation }: ForksCountInputProps) {
    let validationText: string | undefined;

    switch(validation) {
        case "LessThanMinForksError":
            validationText = "Number of forks must be greater than" + {MIN_FORKS};
            break;
        case "GreaterThanMaxForksError":
            validationText = "Number of forks msut be less than" + {MAX_FORKS};
    }

    return (
        <FormControl id="forksCount">
            <FormControl.Label>Forks</FormControl.Label>
            <TextInput type="number" placeholder="5" min={MIN_FORKS} max={MAX_FORKS} />
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