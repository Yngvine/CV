import React from "react";
// State
import { useGetUsersQuery } from "../app/apiSlice";
// Components
import Hero from "../components/Hero";
import AboutMe from "../components/AboutMe";
import Skills from "../components/Skills";
import ProfessionalExperience from "../components/ProfessionalExperience";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import BackToTop from "../components/BackToTop";
// Config
import { filteredProjects } from "../config";
// Utils
import { updateTitle } from "../utils";

import Data from "../CV.json"

// #region component
const Home = () => {
  const { data: userData } = useGetUsersQuery();

  React.useEffect(() => {
    updateTitle(`${Data.personal_information.name_simplified} | Portfolio`);
  }, [userData]);

  return (
    <>
      <Hero name={Data.personal_information.name} />
      <main>
        <AboutMe
          avatar_url={userData.avatar_url}
          bio={"Most notable interests: " + Data.personal_interests.join(", ")}
          moreInfo={Data.additional_info}
          languages={Data.languages}
        />
        <Skills />
        <ProfessionalExperience />
        <Projects filteredProjects={filteredProjects} />
        <Contact />
      </main>
      <BackToTop />
    </>
  );
};
// #endregion

export default Home;
