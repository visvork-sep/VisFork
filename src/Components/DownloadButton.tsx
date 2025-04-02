import { useDataContext } from "@Providers/DataProvider";
import { Button } from "@primer/react";
import { useCallback } from "react";

function DownloadJsonButton() {
    const { data } = useDataContext();

    const handleDownload = useCallback(() => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }, [data]);

    return <Button aria-label={"Export Data as JSON"} onClick={handleDownload}>Download JSON</Button>;
};

export default DownloadJsonButton;
