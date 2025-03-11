import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
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
