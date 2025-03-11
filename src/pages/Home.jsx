import React from "react";
// State
import { useGetUsersQuery } from "../app/apiSlice";
// Components
import Hero from "../components/Hero";
import AboutMe from "../components/AboutMe";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import BackToTop from "../components/BackToTop";
import Loading from "../components/Loading"; // Assuming a Loading component exists
import Container from 'react-bootstrap/Container'; // Assuming you are using react-bootstrap

// Config
import { filteredProjects, moreInfo } from "../config";
// Utils
import { updateTitle } from "../utils";

// #region component
const Home = () => {
  const { data: userData } = useGetUsersQuery();

  React.useEffect(() => {
    updateTitle(`${userData.name} | Portfolio`);
  }, [userData]);

  // Reference CV data
  const [cvDataJSON, setCvDataJSON] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    fetch('/CV.json')
      .then(response => response.json())
      .then(data => {
        setCvDataJSON(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading CV data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex vh-100 align-items-center justify-content-center">
        <Loading />
      </Container>
    );
  }

  return (
    <>
      <Hero name={cvDataJSON?.personal_information?.name || userData?.name}/>
      <main>
        <AboutMe
          avatar_url={userData.avatar_url}
          bio={userData.bio}
          moreInfo={moreInfo}
        />
        <Skills />
        <Projects filteredProjects={filteredProjects} />
        <Contact />
      </main>
      <BackToTop />
    </>
  );
};
// #endregion

export default Home;