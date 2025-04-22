import React, { useEffect, useState } from "react";
// State
import { useSelector } from "react-redux";
import { selectMode } from "../app/appSlice";
import { selectProjects, selectMainProjects } from "../app/projectsSlice";
import { useGetProjectsQuery } from "../app/apiSlice";
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
import * as Data from "../CV.json"

// #region component
const Projects = () => {
  const theme = useSelector(selectMode);
  const [projects, setProjects] = useState([]);
  const [mainProjects, setMainProjects] = useState([]);
  const { isLoading, isSuccess, isError, error } = useGetProjectsQuery();
  let content;

  useEffect(() => {
    setProjects(Data.projects.map((project, index) => ({
      id: index + 1,
      name: project.title,
      description: project.description,
      urls: project.links,
    })));
    setMainProjects(Data.projects.map((project, index) => ({
      id: index + 1,
      name: project.title,
      image: project.image ? require(`../${project.image}`) : null,
      description: project.description,
      urls: project.links,
    })));
  }, []);

  if (isLoading) {
    content = (
      <Container className="d-flex">
        <Loading />
      </Container>
    );
  } else if (isSuccess) {
    content = (
      <>
        {!error && projects.length === 0 && (
          <h2 className="text-center">
            Oops, you do not have any GitHub projects yet...
          </h2>
        )}
        {mainProjects.length !== 0 && (
          <>
            <Row xs={1} md={1} lg={2} className="g-4 justify-content-center">
              {mainProjects.map((element) => {
                console.log(element.id);
                return (
                  <Col key={element.id}>
                    <ProjectCard
                      image={element.image}
                      name={element.name}
                      description={element.description}
                      urls={element.urls}
                      demo={element.homepage}
                    />
                  </Col>
                );
              })}
            </Row>
            {projects.length > 3 && (
              <Container className="text-center mt-5">
                <Link to="/All-Projects">
                  <Button
                    size="lg"
                    variant={
                      theme === "light" ? "outline-dark" : "outline-light"
                    }
                  >
                    All <Icon icon="icomoon-free:github" /> Projects
                  </Button>
                </Link>
              </Container>
            )}
          </>
        )}
      </>
    );
  } else if (isError) {
    content = (
      <Container className="d-flex align-items-center justify-content-center">
        <h2>{`${error.status} - check getProjects query in src/app/apiSlice.js`}</h2>
      </Container>
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
