import { SplitPageLayout, Dialog, Button } from "@primer/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "@Components/AppHeader";
import DataComponents from "@Components/DataComponents";
import { DataProvider } from "@Providers/DataProvider";

/**
 * HomePage Component
 *
 * Displays the main layout of the application, including:
 * - A header with navigation and authentication controls.
 * - The primary data display component (DataComponents).
 * - A footer for the page.
 * - An optional error popup if the user encounters an OAuth error.
 */
export default function HomePage() {
    // Gives information about the current route, including any state passed via navigation.
    const location = useLocation();
    // Allows programmatic navigation to other routes in the application.
    const navigate = useNavigate();

    //Determines whether an error dialog should appear, based on the router state.
    //We store it in local state so that once we clear the router state, this flag won't reset.
    const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(() => {
        return location.state?.fromError ?? false;
    });

    //Holds the error text we want to display in the dialog, if any.
    //Copied from location.state, ensuring we keep the message after clearing router state.
    const [errorText] = useState(() => {
        return location.state?.errorDescription ?? "";
    });

    //Clears location.state after the first render if an error was present.
    //This prevents the error dialog from reopening on a page refresh.
    useEffect(() => {
        if (location.state?.fromError) {
            navigate(".", { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <DataProvider>
            {/* 
                Primary layout container using Primer’s SplitPageLayout component.
                Includes a header, main section, and a footer. 
            */}
            <SplitPageLayout>
                <SplitPageLayout.Header aria-label="Header">
                    <AppHeader />
                </SplitPageLayout.Header>
                <DataComponents />
                <SplitPageLayout.Footer aria-label="Footer">
                    <div>Footer</div>
                </SplitPageLayout.Footer>
            </SplitPageLayout>

            {/**
                Conditionally render the Dialog if an error was detected.
            */}
            {isErrorPopupOpen && (
                <Dialog
                    title="Authentication Error"
                    onClose={() => setIsErrorPopupOpen(false)}
                    position="center"
                >
                    <Dialog.Body>
                        <p>Authentication ran into an error:  <br />{errorText || "No error message provided."} </p>
                        <Button onClick={() => setIsErrorPopupOpen(false)}>
                            Close
                        </Button>
                    </Dialog.Body>
                </Dialog>
            )}
        </DataProvider >
    );
}
