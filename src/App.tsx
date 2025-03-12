import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";

/**
 * Root Application Component
 * 
 * This component initializes the router and renders all application routes.
 */
function App() {
    //Sending data to AppHeader below
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App;
