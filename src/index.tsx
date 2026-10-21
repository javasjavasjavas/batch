import "./index.css";
import ReactDOM from "react-dom/client";
import { App, routes } from "./App";
import { createBrowserRouter } from "react-router-dom";
const router = createBrowserRouter(routes);

const rootEl = document.getElementById("root");
if (rootEl) {
  const mount = () => ReactDOM.createRoot(rootEl).render(<App router={router} />);
  // Preserve the static page while a directly opened workspace loads its route.
  if (router.state.initialized) mount();
  else {
    const unsubscribe = router.subscribe((state) => {
      if (state.initialized) { unsubscribe(); mount(); }
    });
  }
}
