import { Button, Stack } from "@primer/react";

function FileButtons() {
    return(
        <Stack direction={"horizontal"} wrap="wrap">
            <Stack.Item>
                <Button aria-label="Download Data as JSON">
                    Download as JSON
                </Button>
            </Stack.Item>
            <Stack.Item>
                <Button aria-label="Import Data as JSON">
                    Import JSON
                </Button>
            </Stack.Item>
        </Stack>
    )
}

export default FileButtons;