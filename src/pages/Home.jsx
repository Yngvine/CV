
import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import AboutMe from "../components/AboutMe";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import BackToTop from "../components/BackToTop";
import { moreInfo } from "../config";
import { updateTitle } from "../utils";
import * as cvData from "../CV.json";

const Home = () => {
  useEffect(() => {
    updateTitle(`${cvData.personal_information.name} | Portfolio`);
  }, []);

  return (
    <>
      <Hero name={cvData.personal_information.name} />
      <main>
        <AboutMe
          avatar_url={`https://github.com/${cvData.personal_information.github.split('/').pop()}.png`}
          bio={cvData.additional_info}
          moreInfo={moreInfo}
        />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <BackToTop />
    </>
  );
};

export default Home;
