import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Data from '../CV.json';
// Styles
import styled from "styled-components";
// Components
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Title from "./Title";

// #region styled-components
const StyledProfessionalExperience = styled.section`
  p {
    font-size: .75rem;
  }
  .img {
    width: 18rem;
    height: 18rem;
  }

  .badge {
    margin: 0.5em;
  }
  
  /* 1) Make each list-item a positioning context */
  .list-group-item {
    position: relative;
    /* leave enough right-padding so your text never overlaps the icon */
    padding-right: 2rem; 
    overflow: visible; /* allow the icon to “bleed” out if needed */
  }
  
  .list-group-item > div {
    border-top-right-radius: inherit;
  }

  .list-group-item > div > div.col-4.text-end{
    border-top-right-radius: inherit;
  }
  
  /* 2) Pull the .svg container out of the grid and stick it to the edge */
  .list-group-item .svg {
    width: var(--svg-max-width);
    border-bottom: var(--bs-list-group-border-width) solid var(--bs-list-group-border-color);
    border-left: var(--bs-list-group-border-width) solid var(--bs-list-group-border-color);
    padding: 0.5rem;
    text-align: center;
    margin-top: -0.5rem;
    margin-right: calc(-2rem - 1px + calc(0.5 * var(--bs-gutter-x))); /* make it flush with the right edge */
    border-bottom-left-radius: 1rem; /* only round the two left corners */
    border-top-right-radius: inherit;
    text-align: center;
    background-color: ${({ theme }) =>
    theme.name === "dark" ? "rgba(255,255,255, 0.8)" : null };
    display: inline-block;
  }

  /* 3) If your .col-4 was just for the icon+dates, you can collapse it */
  .list-group-item .col-4 {
    padding-right: 0; /* remove its own padding so it doesn’t fight the absolute */
  }
`;
// #endregion

const ProfessionalExperience = () => {
  const [experience, setExperience] = useState([]);
  const [maxWidth, setMaxWidth] = useState(0);
  const svgRefs = useRef([]);

  useEffect(() => {
    setExperience(Data.working_experience.map((experience) => ({
      title: experience.title,
      icon: <Icon icon={experience.logo} className="display-4" />,
      company: experience.company,
      dates: `${experience.start_date} - ${experience.end_date}`,
      description: experience.description,
      responsibilities: experience.responsibilities,
    })));
    svgRefs.current = [];
  },[]);

  // measure *before* paint so we see real widths
  useLayoutEffect(() => {
    const els = svgRefs.current.filter(el => el != null);

    // only measure once all icons are mounted
    if (els.length === experience.length) {
      // wait until the next frame, after layout+paint
      window.requestAnimationFrame(() => {
        const widths = els.map(el => el.getBoundingClientRect().width || 0);
        const m = Math.max(...widths);
        setMaxWidth(m);
      });
    }
  }, [experience]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const widths = svgRefs.current.map(el => el.getBoundingClientRect().width);
      setMaxWidth(Math.max(...widths));
    });
    svgRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [experience]);

  
  
  return (
    <Element name={"Experience"} id="experience">
      <StyledProfessionalExperience className="section" 
        style={{ "--svg-max-width": maxWidth ? `${maxWidth}px` : undefined }}>
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Professional Experience"} />
          </Container>
          <Row className="mt-5">
              <Col className="text-center">
                <ul className="list-group">
                  {experience.map((experience, index) => (
                    <li key={index} className="list-group-item">
                      <div className="row">
                        <div className="col-8 text-start">
                          <h4>{experience.title}</h4>
                          <h5>{experience.company}</h5>
                          <p>{experience.description}</p>
                        </div>
                        <div className="col-4 text-end">
                          <div className="svg" ref={el => {svgRefs.current[index] = el;}}>
                            {experience.icon}
                          </div>
                          <p>{experience.dates}</p>
                        </div>
                      </div>
                      {experience.responsibilities.map((responsibility, index) => (
                        <span class="badge text-bg-secondary" key={index}>{responsibility}</span>
                      ))}
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
        </Container>
      </StyledProfessionalExperience>
    </Element>
  );
}

export default ProfessionalExperience;