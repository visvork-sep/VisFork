import AppHeader from "@Components/AppHeader";
import ApplicationBody from "@Components/ApplicationBody";
import { PageLayout } from "@primer/react";


function App() {
  return (
    <PageLayout>
      <PageLayout.Header>
        <AppHeader/>
      </PageLayout.Header>
      <PageLayout.Content >
        <ApplicationBody/>
      </PageLayout.Content>
      <PageLayout.Footer>
        <div>Footer</div>
      </PageLayout.Footer>
    </PageLayout>
  );
}

export default App; 