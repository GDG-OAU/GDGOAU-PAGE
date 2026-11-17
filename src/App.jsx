import Header from "./components/Header";
import HomePage from "./components/HomePage";
import { lazy, Suspense } from "react";

const CommunitiesPage = lazy(() => import("./components/CommunitiesPage"));
const CalendarPage = lazy(() => import("./components/CalendarPage"));
const RegistrationPage = lazy(() => import("./components/RegistrationPage"));

export default function App() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <>
      <Suspense fallback={null}>
        {currentPath === "/communities" && <CommunitiesPage />}
        {currentPath === "/calendar" && <CalendarPage />}
        {currentPath === "/page" && <RegistrationPage />}
      </Suspense>
      {currentPath === "/" && (
        <>
          <Header activePage="home" />
          <HomePage />
        </>
      )}
    </>
  );
}
