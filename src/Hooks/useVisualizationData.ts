import { useState, useCallback, useEffect } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";

interface VisualizationData {
    forkListData: ForkListData,
    commitTableData: CommitTableData
    //TODO: expand with other interfaces and separate
}

// const initialData = [];
export function useVisualizationData(initialData: VisualizationData) {
    const [visData, setVisData] = useState<VisualizationData>(initialData);

    // Handle updates when new data is passed
    useEffect(() => {
        setVisData(initialData);
    }, [initialData]);

    const handleForkListDataChange = useCallback((input: ForkListData ) => {
        setVisData({...visData, forkListData:input});
    }, []);

    const forkListData = visData?.forkListData;
    const commitTableData = visData?.commitTableData;
    //TODO: add other handlers
    return {forkListData,commitTableData, setVisData, handleForkListDataChange};
}
