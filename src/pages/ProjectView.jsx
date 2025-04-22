
import React from "react";
import { useParams } from "react-router-dom";
import { Carousel, Container, Row, Col, Button } from "react-bootstrap";
import styled from "styled-components";
import { Icon } from "@iconify/react";
import * as Data from "../CV.json";

const StyledSection = styled.section`
  .carousel {
    max-height: 400px;
    margin-bottom: 2rem;
    
    img {
      max-height: 400px;
      object-fit: contain;
    }
  }

  .project-title {
    text-align: center;
    margin-bottom: 2rem;
  }

  .project-info {
    background: ${({ theme }) =>
      theme.name === "light" ? "rgba(255,255,255,0.9)" : "rgba(33,37,41,0.9)"};
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .info-item {
    margin-bottom: 1rem;
  }

  .links-section {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid ${({ theme }) =>
      theme.name === "light" ? "#dee2e6" : "#495057"};
  }

  .link-button {
    margin: 0.5rem;
  }
`;

const ProjectView = () => {
  const { id } = useParams();
  const project = Data.projects[parseInt(id) - 1];

  return (
    <main>
      <StyledSection>
        <Container>
          {project.images && project.images.length > 0 && (
            <Carousel>
              {project.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={require(`../images/${image}`)}
                    alt={`Slide ${index + 1}`}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          )}

          <h1 className="project-title">{project.title}</h1>

          <Row>
            <Col md={8}>
              <div className="project-info">
                <h3>Description</h3>
                <p>{project.description}</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="project-info">
                <div className="info-item">
                  <strong>Period:</strong> {project.year}
                </div>
                <div className="info-item">
                  <strong>Status:</strong> {project.status}
                </div>
                <div className="info-item">
                  <strong>Type:</strong> {project.type}
                </div>
                {project.skills && (
                  <div className="info-item">
                    <strong>Skills:</strong>
                    <ul>
                      {project.skills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <div className="links-section">
            {project.links && project.links.map((link, index) => (
              <Button
                key={index}
                variant="primary"
                href={link}
                target="_blank"
                className="link-button"
              >
                <Icon icon="mdi:link-variant" /> Link {index + 1}
              </Button>
            ))}
          </div>
        </Container>
      </StyledSection>
    </main>
  );
};

export default ProjectView;
