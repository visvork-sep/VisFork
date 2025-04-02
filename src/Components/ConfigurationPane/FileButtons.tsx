import DownloadJsonButton from "@Components/DownloadButton";
import { Button, Stack } from "@primer/react";

function FileButtons() {
    return (
        <Stack direction={"horizontal"} wrap="wrap">
            <Stack.Item>
                <Stack.Item>
                    <DownloadJsonButton />
                </Stack.Item>
            </Stack.Item>
            <Stack.Item>
                <Button aria-label="Import Data as JSON">
                    Import JSON
                </Button>
            </Stack.Item>
        </Stack >
    );
}

export default FileButtons;
