import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CommunitiesPage from "./components/CommunitiesPage";
import CalendarPage from "./components/CalendarPage";
import RegistrationPage from "./components/RegistrationPage";

export default function App() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <>
      {currentPath === "/communities" && <CommunitiesPage />}
      {currentPath === "/calendar" && <CalendarPage />}
      {currentPath === "/page" && <RegistrationPage />}
      {currentPath === "/" && (
        <>
          <Header activePage="home" />
          <HomePage />
        </>
      )}
    </>
  );
}
