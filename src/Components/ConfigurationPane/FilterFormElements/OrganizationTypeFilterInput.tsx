import { Checkbox, CheckboxGroup, FormControl } from "@primer/react";

function OrganizationTypeFilterInput() {
    return (
        <CheckboxGroup>
            <CheckboxGroup.Label>Included Owners</CheckboxGroup.Label>
            <FormControl>
                <FormControl.Label>User</FormControl.Label>
                <Checkbox value="user"/>
            </FormControl>
            <FormControl>
                <FormControl.Label>Organization</FormControl.Label>
                <Checkbox value="organization"/>
            </FormControl>
        </CheckboxGroup>
    );
}

export {
    OrganizationTypeFilterInput
};
