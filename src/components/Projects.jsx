import React from "react";
// State
import * as cvData from "../CV.json";
// Router
import { Link } from "react-router-dom";
// Icons
import { Icon } from "@iconify/react";
// Components
import { Element } from "react-scroll";
import { Button, Col, Container, Row } from "react-bootstrap";
import Loading from "./Loading";
import Title from "./Title";
import ProjectCard from "./ProjectCard";

// #region component
const Projects = () => {
  // Assuming CV.json has a "projects" array with similar structure to the previous GitHub data
  const projects = cvData.projects || []; // Handle potential missing projects array
  const mainProjects = projects.slice(0, 3); // Show first 3 projects
  const theme = "light"; // Placeholder - needs proper state management if needed

  // No longer need isLoading, isSuccess, isError, error from useGetProjectsQuery
  let content;


  if (projects.length === 0) {
    content = (
      <h2 className="text-center">
        Oops, you do not have any projects listed in your CV yet...
      </h2>
    );
  } else {
    content = (
      <>
        <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
          {mainProjects.map((element) => {
            // Adapt property names to match CV.json structure.  These are assumptions.
            return (
              <Col key={element.id || element.name}> {/* Use id or name as key */}
                <ProjectCard
                  image={element.image || element.imageUrl} // Adjust property name as needed
                  name={element.title || element.name} // Adjust property name as needed
                  description={element.description}
                  url={element.url || element.githubUrl} // Adjust property name as needed
                  demo={element.demoUrl || element.liveUrl} // Adjust property name as needed
                />
              </Col>
            );
          })}
        </Row>
        {projects.length > 3 && (
          <Container className="text-center mt-5">
            <Link to="/All-Projects"> {/* Adjust link if needed */}
              <Button size="lg" variant={theme === "light" ? "outline-dark" : "outline-light"}>
                All Projects
              </Button>
            </Link>
          </Container>
        )}
      </>
    );
  }

  return (
    <Element name={"Projects"} id="projects">
      <section className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"Projects"} />
          </Container>
          {content}
        </Container>
      </section>
    </Element>
  );
};
// #endregion

export default Projects;