import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import MaterialDetail from "./pages/MaterialDetail";
import Catalog from "./pages/Catalog";
import KnowledgeBase from "./pages/KnowledgeBase";
import Calculators from "./pages/Calculators";

function Router() {
  return (
    <Switch>
      <Route path="" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/calculators" component={Calculators} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/material/:id" component={MaterialDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
