import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import MaterialDetail from "./pages/MaterialDetail";
import Catalog from "./pages/Catalog";
import KnowledgeBase from "./pages/KnowledgeBase";
import Calculators from "./pages/Calculators";
import Tools from "./pages/Tools";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Saved from "./pages/Saved";

function Router() {
  return (
    <Switch>
      <Route path="" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/tools" component={Tools} />
      <Route path="/calculators" component={Calculators} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/material/:id" component={MaterialDetail} />
      <Route path="/login" component={Login} />
      <Route path="/account" component={Account} />
      <Route path="/saved" component={Saved} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster theme="dark" />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
