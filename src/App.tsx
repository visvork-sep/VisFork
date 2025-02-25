import AppHeader from "@Components/AppHeader";
import DataComponents from "@Components/DataComponents";
import { SplitPageLayout } from "@primer/react";

function App() {
    return (
        <SplitPageLayout>
            <SplitPageLayout.Header aria-label="Header">
                <AppHeader/>
            </SplitPageLayout.Header>
    
            <DataComponents/>

            <SplitPageLayout.Footer aria-label="Footer">
                <div>Footer</div>
            </SplitPageLayout.Footer>
        </SplitPageLayout>
    );
}

export default App;
