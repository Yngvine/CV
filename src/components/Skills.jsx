import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectMode } from "../app/appSlice";
import { Element } from "react-scroll";
import { Button, Col, Container, Row, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Title from "./Title";
import { resume } from "../config";
import Data from "../CV.json";

const Skills = () => {
  const theme = useSelector(selectMode);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    console.log(Data.aptitudes);
    setSkills(
      Data.aptitudes.map((skill, index) => ({
        id: index + 1,
        skill: <Icon icon={skill.icon} className="display-4" />,
        name: skill.name,
        level_num: skill.level_num,  // Assuming level_num exists in the JSON data
        level: skill.level,  // Text value for the level (like "Beginner", "Intermediate", etc.)
      })),
    );
  }, []);

  // Function to render progress bar segments
  const renderProgressBar = (levelNum) => {
    const segments = [];
    const filledSegments = Math.round((levelNum / 5) * 5); // Fill segments based on level_num

    for (let i = 0; i < 5; i++) {
      segments.push(
        <div
          key={i}
          style={{
            width: "20%",
            height: "10px",
            marginRight: "2px",
            backgroundColor: i < filledSegments ? "#007bff" : "#e0e0e0",
            borderRadius: "5px",
          }}
        />
      );
    }

    return segments;
  };

  return (
    <Element name={"Skills"} id="skills">
      <section className="section">
        <Container className="text-center">
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Skills"} />
          </Container>
          <Row xs={3} md={4} lg={6} className="mt-3 align-items-center" style={{ justifyContent: "center" }}>
            {skills.map((skill) => (
              <Col key={skill.id} className="my-md-5" style={{ textAlign: "center" }}>
                <figure>
                  {skill.skill}
                  <figcaption>{skill.name}</figcaption>

                  {/* Render the progress bar */}
                  <div className="progress-bar-container" style={{ marginTop: "10px" }}>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>{skill.level}</Tooltip>}
                    >
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {renderProgressBar(skill.level_num)}
                      </div>
                    </OverlayTrigger>
                  </div>
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
