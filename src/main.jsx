import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import Router from "./router";
import ErrorBoundary from "./components/ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary showDetails={true}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Router />
          </HashRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
