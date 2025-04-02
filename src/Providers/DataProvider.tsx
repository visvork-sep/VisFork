import { createContext, useContext, useState } from "react";

// Define the shape of the data
interface DataContextType {
    data: object;
    setData: (data: object) => void;
}

// Create the context with default values
const DataContext = createContext<DataContextType | undefined>(undefined);

// Custom hook for using context
const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useDataContext must be used within a DataProvider");
    }
    return context;
};

// Provider component to wrap the app
function DataProvider({ children }: { children: React.ReactNode; }) {
    const [data, setData] = useState<object>({});
    return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
};

export { DataProvider, useDataContext };
