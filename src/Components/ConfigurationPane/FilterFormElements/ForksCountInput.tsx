import { FormControl, TextInput } from "@primer/react";
import { MIN_FORKS, MAX_FORKS } from "@Utils/Constants";
import { ChangeEvent } from "react";

type ForksCountInputValidation = "lessThanMinForksError" | "greaterThanMaxForksError" | "unknownError";

interface ForksCountInputProps {
    validation?: ForksCountInputValidation;
    onChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
};

function ForksCountInput({ validation, onChangeHandler }: ForksCountInputProps) {
    let validationText: string | undefined;

    switch(validation) {
        case "lessThanMinForksError":
            validationText = "Number of forks must be greater than" + {MIN_FORKS};
            break;
        case "greaterThanMaxForksError":
            validationText = "Number of forks msut be less than" + {MAX_FORKS};
            break;
        case "unknownError":
            validationText = "Unknown error in field";
    }

    return (
        <FormControl id="forksCount">
            <FormControl.Label>Forks</FormControl.Label>
            <FormControl.Caption>
                The amount of forks to analyze
            </FormControl.Caption>
            <TextInput type="number" placeholder="5" min={MIN_FORKS} max={MAX_FORKS} onChange={onChangeHandler}/>
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
