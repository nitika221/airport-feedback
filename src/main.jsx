import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "✅ Service Worker Registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.log(
          "❌ Service Worker Registration Failed:",
          error
        );
      });
  });
}