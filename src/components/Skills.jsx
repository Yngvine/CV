import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectMode } from "../app/appSlice";
import { Element } from "react-scroll";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Title from "./Title";
import { resume } from "../config";
import * as Data from "../CV.json";

const Skills = () => {
  const theme = useSelector(selectMode);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    console.log(Data.aptitudes);
    setSkills(
      Data.aptitudes.map((skill, index) => ({
        id: index + 1,
        skill: <Icon icon={skill.icon} className="display-4" />,
        name: `${skill.name} (${skill.level})`,
      })),
    );  
  }, []);

  return (
    <Element name={"Skills"} id="skills">
      <section className="section">
        <Container className="text-center">
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Skills"} />
          </Container>
          <Row className="mt-3 align-items-center">
            {skills.map((skill) => (
              <Col xs={4} key={skill.id} className="my-md-5">
                <figure>
                  {skill.skill}
                  <figcaption>{skill.name}</figcaption>
                </figure>
              </Col>
            ))}
          </Row>
          {resume && (
            <a href={resume}>
              <Button
                size="lg"
                variant={theme === "light" ? "outline-dark" : "outline-light"}
                className="mt-5"
              >
                R&eacute;sum&eacute;
              </Button>
            </a>
          )}
        </Container>
      </section>
    </Element>
  );
};

export default Skills;
