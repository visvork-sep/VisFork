import { CheckboxGroup, FormControl, Checkbox } from "@primer/react";

function ForksTypeFilterInput() {
    return(
        <CheckboxGroup>
            <CheckboxGroup.Label>Included forks</CheckboxGroup.Label>
            <CheckboxGroup.Caption>Fork types to include into visualizations</CheckboxGroup.Caption>
            <FormControl>
                <FormControl.Label>Adaptive</FormControl.Label>
                <Checkbox value="adaptive"/>
            </FormControl>
            <FormControl>
                <FormControl.Label>Corrective</FormControl.Label>
                <Checkbox value="corrective"/>
            </FormControl>
            <FormControl>
                <FormControl.Label>Perfective</FormControl.Label>
                <Checkbox value="perfective"/>
            </FormControl>
        </CheckboxGroup>
    );
}

export {
    ForksTypeFilterInput
};
