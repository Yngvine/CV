import React from "react";
import { ThemeProvider } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { selectMode, setMode } from "./app/appSlice";
import { setProjects, setMainProjects, selectProjects } from "./app/projectsSlice";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AllProjects from "./pages/AllProjects";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "react-error-boundary";
import AppFallback from "./components/AppFallback";
import GlobalStyles from "./components/GlobalStyles";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import { Element } from "react-scroll";
import { Container } from "react-bootstrap";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { footerTheme, navLogo } from "./config";
import { getStoredTheme, getPreferredTheme, setTheme } from "./utils";

const App = ({ projectCardImages = [], filteredProjects = [] }) => {
  const theme = useSelector(selectMode);
  const projects = useSelector(selectProjects);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  import * as cvData from "./CV.json";

  // Set all projects state
  React.useEffect(() => {
    if (cvData.projects) {
      const tempData = Object.values(cvData.projects).flat().map((project, index) => ({
        id: index,
        name: project.title,
        description: project.description,
        homepage: project.demo,
        html_url: project.repository
      }));

      if (projectCardImages?.length > 0) {
        projectCardImages.forEach((element) => {
          tempData.forEach((ele) => {
            if (element.name.toLowerCase() === ele.name.toLowerCase()) {
              ele.image = element.image;
            }
          });
        });
      }
      dispatch(setProjects(tempData));
    }
  }, [cvData, projectCardImages, dispatch]);

  // Set main projects state
  React.useEffect(() => {
    if (projects.length !== 0) {
      if (filteredProjects?.length > 0) {
        const tempArray = projects.filter((obj) =>
          filteredProjects.includes(obj.name)
        );
        tempArray.length !== 0
          ? dispatch(setMainProjects([...tempArray]))
          : dispatch(setMainProjects([...projects.slice(0, 3)]));
      } else {
        dispatch(setMainProjects([...projects.slice(0, 3)]));
      }
    }
  }, [projects, filteredProjects, dispatch]);

  // Theme
  const setThemes = React.useCallback(
    (theme) => {
      if (theme) {
        dispatch(setMode(theme));
        setTheme(theme);
      } else {
        dispatch(setMode(getPreferredTheme()));
        setTheme(getPreferredTheme());
      }
    },
    [dispatch]
  );

  React.useEffect(() => {
    setThemes();
  }, [setThemes]);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const storedTheme = getStoredTheme();
      if (storedTheme !== "light" && storedTheme !== "dark") {
        setThemes();
      }
    });

  let content;

  if (isLoading) {
    content = (
      <Container className="d-flex vh-100 align-items-center">
        <Loading />
      </Container>
    );
  } else if (cvData) {
    content = (
      <>
        <Element name={"Home"} id="home">
          <NavBar Logo={navLogo} callBack={(theme) => setThemes(theme)} />
        </Element>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/All-Projects" element={<AllProjects />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer mode={footerTheme} />
      </>
    );
  } else {
    content = (
      <Container className="d-flex vh-100 align-items-center justify-content-center">
        <h2>Error loading CV data</h2>
      </Container>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={AppFallback}>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider theme={{ name: theme }}>
          <ScrollToTop />
          <GlobalStyles />
          {content}
        </ThemeProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;