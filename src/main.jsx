import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter,HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import Router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Router />
        </HashRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
