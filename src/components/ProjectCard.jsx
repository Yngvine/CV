import React from "react";
// Styles
import styled from "styled-components";
// State
import PropTypes from "prop-types";
// Icons
import { Icon } from "@iconify/react";
// Images
import GH from "../images/GH.svg";
// Components
import { Card } from "react-bootstrap";

// #region styled-components
const StyledCard = styled.div`
  .card {
    height: var(--card-height);
    border: var(--border);
    border-radius: 0;
    transition: all 0.2s ease-in-out;
    background: ${({ theme }) =>
      theme.name === "light" ? "" : "var(--bs-gray)"};
    box-shadow: ${({ theme }) =>
      theme.name === "light"
        ? "0 3px 10px rgb(0 0 0 / 0.2)"
        : "0 3px 10px rgb(255 255 255 / 0.2)"};

    .card-title {
      font-size: 1.5rem;
    }

    .card-img-top {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }

    .card-body {
      height: 50%;
      display: flex;
      flex-direction: column;
      min-height: 0;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: ${({ theme }) =>
        theme.name === "light"
          ? "rgba(255, 255, 255, 0.85)"
          : "rgba(33, 37, 41, 0.85)"};
      z-index: 1;

      .card-text {
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        max-height: calc(1.2em * 3);
        padding-bottom: 0.25rem;
        line-height: 1.2em;
      }
    }

    .card-link {
      text-decoration: none;
      font-size: 1rem;

      &:hover {
        color: ${({ theme }) =>
          theme.name === "light" ? "var(--bs-dark)" : "var(--bs-light)"};
      }
    }

    .card-footer {
      border-top: var(--border);
      border-radius: 0;
      background: ${({ theme }) =>
        theme.name === "light" ? "" : "var(--bs-gray-dark)"};
      z-index: 1;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;

      .card-link {
        color: ${({ theme }) =>
          theme.name === "light" ? "var(--bs-dark)" : "var(--bs-light)"};

        &:hover {
          color: var(--bs-primary);
        }
      }
    }

    &:hover {
      transform: scale(1.03);
    }

  }
`;
// #endregion

// #region component
const propTypes = {
  demo: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.node,
  period: PropTypes.string,
  status: PropTypes.string,
  name: PropTypes.string.isRequired,
  urls: PropTypes.array,
};

const ProjectCard = ({ demo, description, image, name, period, status, }) => {
  return (
    <StyledCard>
      <Card>
        <Card.Img
          variant="top"
          src={image ? image : GH}
          alt={name}
          className="mx-auto"
        />
        <Card.Body className="text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text>{description}</Card.Text>
          {demo !== (undefined && null && "") ? (
            <Card.Link href={demo}>
              {"Live Demo "}
              <Icon icon="icon-park-outline:code-computer" />
            </Card.Link>
          ) : null}
        </Card.Body>
        <Card.Footer className="text-center">
          {period && (
            <Card.Link>
              <Icon icon="mdi:calendar-month-outline" /> {period}
            </Card.Link>
          )}
          {status && (
            <Card.Link>
              <Icon icon="ic:baseline-check-circle" /> {status}
            </Card.Link>
          )}
        </Card.Footer>
      </Card>
    </StyledCard>
  );
};

ProjectCard.propTypes = propTypes;
// #endregion

export default ProjectCard;