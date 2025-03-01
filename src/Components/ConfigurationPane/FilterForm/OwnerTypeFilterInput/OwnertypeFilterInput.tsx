import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";
import { OWNERTYPES } from "@Utils/Constants";

interface OwnerTypeFilterInputProps {
    onChangeHandler: (selected: string[]) => void;
}

function OwnerTypeFilterInput({ onChangeHandler }: OwnerTypeFilterInputProps) {
    const checkBoxes = OWNERTYPES.map((ownerType) => (
        <FormControl key={ownerType}>
            <FormControl.Label>{ownerType}</FormControl.Label>
            <Checkbox value={ownerType} />
        </FormControl>));


    return (
        <CheckboxGroup onChange={onChangeHandler}>
            <CheckboxGroup.Label>Included owners</CheckboxGroup.Label>
            {checkBoxes}
        </CheckboxGroup>
    );
}

export {
    OwnerTypeFilterInput
};
