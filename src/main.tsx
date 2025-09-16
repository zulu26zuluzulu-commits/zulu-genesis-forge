import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { fetchRuntimeConfig } from '@/lib/aiConfig';

async function bootstrap() {
  // try to fetch runtime config; don't fail the app if this errors
  try {
    await fetchRuntimeConfig();
  } catch (e) {
    // ignore
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
