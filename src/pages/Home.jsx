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
  
  React.useEffect(() => {
    fetch('/CV.json')
      .then(response => response.json())
      .then(data => {
        setCvDataJSON(data);
      })
      .catch(error => console.error('Error loading CV data:', error));
  }, []);

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
