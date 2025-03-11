import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes"; // Import the new routing component

function App() {
    //Sending data to AppHeader below
    return (
        <>
            <Router>
                <AppRoutes />
            </Router>
        </>

    );
}

export default App;
