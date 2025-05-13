import React from "react";
// Styles
import styled from "styled-components";
// State
import PropTypes from "prop-types";
// Components
import { Element } from "react-scroll";
import { Col, Container, Row } from "react-bootstrap";
import Title from "./Title";

import ReactCountryFlag from "react-country-flag";

// #region styled-components
const StyledAboutMe = styled.section`
  p {
    font-size: 1.25rem;
  }
  .img {
    width: 18rem;
    height: 18rem;
  }
`;
// #endregion

// #region component
const propTypes = {
  avatar_url: PropTypes.string.isRequired,
  bio: PropTypes.string,
  moreInfo: PropTypes.string,
  languages: PropTypes.any,
};

const AboutMe = ({ avatar_url, bio, moreInfo, languages }) => {
  return (
    <Element name={"About"} id="about">
      <StyledAboutMe className="section">
        <Container>
          <Container className="d-flex justify-content-center">
            <Title size={"h2"} text={"About Me"} />
          </Container>
          <Row className="align-items-center mt-5">
            <Col className="d-flex flex-column text-center">
              <Container>
                {bio && <p>{bio}</p>}
                {moreInfo && <p>{moreInfo}</p>}
              </Container>
            </Col>
            <Col className="d-none d-md-block text-center">
              <img
                src={avatar_url}
                alt="GitHub Avatar"
                loading="lazy"
                className="mx-auto border border-primary-subtle"
                style={{ width: "15rem", height: "15rem", borderRadius: "25%" }}
              />
            </Col>
          </Row>
          <Row className="mt-5">
            <Col className="text-center">
              <h3 className="mb-3">Languages</h3>
              <ul className="list-group">
                {languages.map((language) => {
                  return(
                    <li className="list-group-item">
                      <div className="row">
                        <div className="col-8 text-start">
                          <span className="fw-bold">
                            <ReactCountryFlag countryCode={language.code} svg style={{ width: '2em', height: '2em' }}/> {language.name} 
                          </span>
                        </div>
                        <div className="col-4 text-end">
                          {language.level}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Col>
          </Row>
        </Container>
      </StyledAboutMe>
    </Element>
  );
};

AboutMe.propTypes = propTypes;
// #endregion

export default AboutMe;
