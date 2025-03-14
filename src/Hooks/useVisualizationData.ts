import { useState, useCallback, useEffect } from "react";
import { ForkListData } from "@VisInterfaces/ForkListData";

interface VisualizationData {
    forkListData: ForkListData,
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
    //TODO: add other handlers
    return {forkListData, setVisData, handleForkListDataChange};
}
