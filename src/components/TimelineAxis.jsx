import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// #region Styled Components
const TimelineWrapper = styled.div`
  position: relative;
  display: grid;
  justify-content: center;
`;

const VerticalLine = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: ${({ theme }) =>
    theme.name === "light" ? "#333" : "#ccc"};
`;

const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const MonthTick = styled.div`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 1px;
  background: ${({ theme }) =>
    theme.name === "light" ? "#333" : "#ccc"};
`;

const MonthLabel = styled.div`
  position: relative;
  left: calc(50% + 12px);
  transform: translateX(0%);
  font-size: 0.75rem;
  color: ${({ theme }) =>
    theme.name === "light" ? "#555" : "#ccc"};
`;

const YearSeparator = styled.div`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  background: ${({ theme }) =>
    theme.name === "light" ? "#fff" : "#212529"};
  padding: 0 0.5rem;
  white-space: nowrap;

  &::before, &::after {
    content: attr(data-year);
    display: inline-block;
    width: 1rem; /* Adjust the desired length of the line */
    height: 1px;
    background-color: ${({ theme }) =>
        theme.name === "light" ? "var(--bs-dark)" : "var(--bs-light)"};
    vertical-align: middle; /* Align the line with the text */
  }
  &::before{
    margin-right: 0.5rem;
  }
  &::after{
    margin-left: 0.5rem;
  }
`;

// #endregion

// Utility to list months between two dates
function getMonthsBetween(start, end) {
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth());
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// #region Component
const TimelineAxis = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = getMonthsBetween(start, end);
  const spacing = 40; // px per row

  // generate CSS grid row heights
  const rowTemplate = `repeat(${months.length * 2 - 1}, ${spacing / 2}px)`;

  return (
    <TimelineWrapper style={{ gridTemplateRows: rowTemplate }}>
      {/* Axis background line */}
      <VerticalLine />

      {/* Rows for each month */}
      {months.flatMap((date, i) => {
        const isJanuary = date.getMonth() === 0;
        const keyBase = date.toISOString();

        // 1) Tick (or Year) row
        const tickRow = (
          <Row key={`tick-${keyBase}`}>
            {isJanuary
              ? <YearSeparator>{date.getFullYear()}</YearSeparator>
              : <MonthTick />
            }
          </Row>
        );

        // 2) Label row *for the same* month, halfway to the next tick
        //    (omit after the very last month if you like)
        const labelRow =
          i < months.length - 1 ? (
            <Row key={`label-${keyBase}`}>
              <MonthLabel>{monthNames[date.getMonth()]}</MonthLabel>
            </Row>
          ) : null;

        return labelRow ? [tickRow, labelRow] : [tickRow];
      })}

    </TimelineWrapper>
  );
};

TimelineAxis.propTypes = {
  startDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string
  ]).isRequired,
  endDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string
  ]).isRequired,
};

export default TimelineAxis;
// #endregion
