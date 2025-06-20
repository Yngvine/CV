import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// === CONFIGURABLE ===
const NUM_LEFT_LANES = 2;
const NUM_RIGHT_LANES = 2;
const SPACING = 40; // px per full row

// #region Styled Components
const TimelineWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ lanes }) =>
    `${"40px ".repeat(lanes.left)}auto ${"40px ".repeat(lanes.right)}`};

  width: max-content;
  column-gap: .5rem;
  margin: 0 auto;
`;

const VerticalLine = styled.div`
  grid-column: ${({ lanes }) => `${lanes.left + 1} / -${lanes.right + 1}`};
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-2px); /* half of 4px line width */
  width: 4px;
  height: 100%;
  background: ${({ theme }) =>
    theme.name === "light" ? "#333" : "#ccc"};
`;

const Row = styled.div`
  grid-column: ${({ lanes }) => lanes.left + 1};
  position: relative;
  display: flex;
  align-items: center;
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

  &::before,
  &::after {
    content: "";
    display: inline-block;
    width: 1rem;
    height: 1px;
    background-color: ${({ theme }) =>
      theme.name === "light" ? "var(--bs-dark)" : "var(--bs-light)"};
    vertical-align: middle;
  }
  &::before {
    margin-right: 0.5rem;
  }
  &::after {
    margin-left: 0.5rem;
  }
`;

const EventBlob = styled.div`
  grid-column: ${({ lane }) => lane};
  justify-self: center;
  transform: translateY(${SPACING / 4}px);
  background: ${({ theme }) =>
    theme.name === "light" ? "#007bff" : "#66b2ff"};
  border-radius: ${SPACING / 2}px;
  width: ${SPACING}px;
  height: ${({ isPoint }) => (isPoint ? `${SPACING}px` : "auto")};
  grid-row: ${({ startRow, endRow }) => `${startRow} / ${endRow}`};

  ${({ isPoint }) =>
    !isPoint &&
    `
    padding: 0.5rem 0;
  `}
`;
// #endregion

function getMonthsBetween(start, end) {
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth());
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

const events = [
  { id: 1, start: "2024-03", end: "2024-03" },
  { id: 2, start: "2024-05", end: "2024-08" },
  { id: 3, start: "2024-06", end: "2024-09" },
  { id: 4, start: "2024-07", end: "2024-10" }, // 3rd layer
  { id: 4, start: "2024-07", end: "2024-10" }, // 4th layer
];

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const TimelineAxis = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = getMonthsBetween(start, end);

  const totalRows = months.length * 2 - 1;
  const rowHeight = SPACING / 2;
  const rowTemplate = `repeat(${totalRows}, ${rowHeight}px)`;

  const occupiedLanes = Array(NUM_LEFT_LANES + NUM_RIGHT_LANES)
    .fill(null)
    .map(() => []);

  const getAvailableLane = (startRow, endRow) => {
    for (let i = 0; i < occupiedLanes.length; i++) {
      const laneOccupied = occupiedLanes[i];
      const overlaps = laneOccupied.some(
        ([a, b]) => !(b <= startRow || a >= endRow)
      );
      if (!overlaps) {
        laneOccupied.push([startRow, endRow]);
        return i;
      }
    }
    return null; // optional: skip if no space
  };

  const getGridColumn = (laneIndex) =>
    laneIndex < NUM_LEFT_LANES
      ? NUM_LEFT_LANES - laneIndex
      : NUM_LEFT_LANES + 2 + (laneIndex - NUM_LEFT_LANES);

  const lanes = { left: NUM_LEFT_LANES, right: NUM_RIGHT_LANES };

  return (
    <TimelineWrapper style={{ gridTemplateRows: rowTemplate }} lanes={lanes}>
      <VerticalLine lanes={lanes} />

      {months.flatMap((date, i) => {
        const isJanuary = date.getMonth() === 0;
        const keyBase = date.toISOString();

        const tickRow = (
          <Row key={`tick-${keyBase}`} lanes={lanes}>
            {isJanuary ? (
              <YearSeparator data-year={date.getFullYear()}>
                {date.getFullYear()}
              </YearSeparator>
            ) : (
              <MonthTick />
            )}
          </Row>
        );

        const labelRow =
          i < months.length - 1 ? (
            <Row key={`label-${keyBase}`} lanes={lanes}>
              <MonthLabel>{monthNames[date.getMonth()]}</MonthLabel>
            </Row>
          ) : null;

        return labelRow ? [tickRow, labelRow] : [tickRow];
      })}

      {events.map((evt) => {
        const [sY, sM] = evt.start.split("-").map(Number);
        const [eY, eM] = evt.end.split("-").map(Number);
        const iStart = months.findIndex((d) => d.getFullYear() === sY && d.getMonth() === sM);
        const iEnd = months.findIndex((d) => d.getFullYear() === eY && d.getMonth() === eM);
        if (iStart < 0 || iEnd < 0) return null;

        const isPoint = iStart === iEnd;
        const startRow = iStart * 2 + 1;
        const endRow = isPoint ? startRow + 1 : (iEnd + 1) * 2 + 1;

        const laneIndex = getAvailableLane(startRow, endRow);
        if (laneIndex === null) return null;

        const gridColumn = getGridColumn(laneIndex);

        return (
          <EventBlob
            key={evt.id}
            startRow={startRow}
            endRow={endRow}
            isPoint={isPoint}
            rowHeight={SPACING}
            lane={gridColumn}
          />
        );
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
  ]).isRequired
};

export default TimelineAxis;
