
import React, { useEffect, useState } from "react";
// Styles
import styled from "styled-components";
// Components
import { Element } from "react-scroll";
import Title from "./Title";
import { Container, Row, Col } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Data from "../CV.json"

const StyledSection = styled.section`
  min-height: calc(100vh - var(--nav-height) - 2rem);
  .contact-item {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;
  }
  .contact-icon {
    font-size: 2rem;
  }
`;

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    setContactInfo(Data.personal_information);
  }, []);

  return (
    <Element name={"Contact"} id="contact">
      <StyledSection className="d-flex flex-column justify-content-center">
        <Container className="d-flex justify-content-center">
          <Title size={"h2"} text={"Contact"} />
        </Container>
        <Container>
          {contactInfo && (
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <div className="contact-item">
                  <Icon icon="mdi:email" className="contact-icon" />
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
                <div className="contact-item">
                  <Icon icon="mdi:map-marker" className="contact-icon" />
                  <span>{contactInfo.location}</span>
                </div>
                <div className="contact-item">
                  <Icon icon="mdi:linkedin" className="contact-icon" />
                  <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
                </div>
                <div className="contact-item">
                  <Icon icon="mdi:github" className="contact-icon" />
                  <a href={contactInfo.github} target="_blank" rel="noopener noreferrer">GitHub Profile</a>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </StyledSection>
    </Element>
  );
};

export default Contact;
