import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { Prev } from "react-bootstrap/esm/PageItem";

// === CONFIGURABLE ===
const NUM_LEFT_LANES = 2;
const NUM_RIGHT_LANES = 2;
const SPACING = 40; // px per full row

// #region Styled Components

const MainLayout = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
`;

const TimelineWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ lanes }) =>
    `${"40px ".repeat(lanes.left)}auto ${"40px ".repeat(lanes.right)}`};
  grid-template-rows: ${({ rowTemplate }) => rowTemplate};
  width: max-content;
  column-gap: 0.5rem;
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
  background: ${({ theme }) => (theme.name === "light" ? "#333" : "#ccc")};
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
  background: ${({ theme }) => (theme.name === "light" ? "#333" : "#ccc")};
`;

const MonthLabel = styled.div`
  position: relative;
  left: calc(50% + 12px);
  font-size: 0.75rem;
  color: ${({ theme }) => (theme.name === "light" ? "#555" : "#ccc")};
`;

const YearSeparator = styled.div`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  background: ${({ theme }) => (theme.name === "light" ? "#fff" : "#212529")};
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
  transform: translateY(${SPACING/4}px);
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

const SideBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => (theme.name === "light" ? "#f9f9f9" : "#333")};
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 0.8rem;
  width: 180px;
`;

const SideColumn = styled.div`
  display: grid;
  grid-template-rows: ${({ rowTemplate }) => rowTemplate};
  position: relative;
`;

const SideBlockGroupContainer = styled.div`
  grid-row: ${({ startRow }) => startRow};
  display: flex;
  transform: translateY(${SPACING/4}px);
  flex-direction: column;
  align-self: start;
`;

const ConnectorLine = styled.div`
  position: absolute;
  height: 2px;
  background: ${({ theme }) => (theme.name === "light" ? "#007bff" : "#66b2ff")};
  opacity: 0.6;
  z-index: 1;
  transform-origin: left center;
`;

const ConnectionContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
`;

const ConnectionSVG = styled.svg`
  position: absolute;
  top: 0;
  left: -250px; /* Extend to cover side cards */
  width: calc(100% + 500px); /* Extend width to cover both sides */
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
`;

// #endregion

function groupByAnkerPoint_s(blobs) {
  // Compute number of rows a card takes PENDING
  const rowsPerCard = 5;
  // Group blobs by ankerPoint if they are within rowsPerCard rows of each other
  const groups = [];
  let currentGroup = [];
  let group = {};

  for (let i = 0; i < blobs.length; i++)
    if (i === 0 || blobs[i].ankerPoint - blobs[i - 1].ankerPoint <= rowsPerCard)
      currentGroup.push(blobs[i]);
    else {
      group = {};
      group.items = currentGroup;
      group.tlength = currentGroup.length * rowsPerCard;
      group.avgRow = Math.floor(
        currentGroup.reduce((sum, blob) => sum + blob.ankerPoint, 0) /
          currentGroup.length,
      );
      group.head = group.avgRow - Math.floor(group.tlength / 2);
      groups.push(group);
      currentGroup = [blobs[i]];
    }
  if (currentGroup.length > 0) group = {};
  group.items = currentGroup;
  group.tlength = currentGroup.length * rowsPerCard;
  group.avgRow = Math.floor(
    currentGroup.reduce((sum, blob) => sum + blob.ankerPoint, 0) /
      currentGroup.length,
  );
  group.head = group.avgRow - Math.floor(group.tlength / 2);
  groups.push(group);
  return groups;
}

function closestPair(blobs){
  let minDist = Infinity;
  let pair = [];
  for (let i = 0; i < blobs.length-1; i++)
    if (Math.abs(blobs[i].center - blobs[i+1].center) < minDist){
      minDist = Math.abs(blobs[i].center - blobs[i+1].center);
      pair = [blobs[i], blobs[i+1]];
    }
  return pair;
}

function spaceCardsInGroup(group) {
  const rowsPerCard = 5;
  const gRCenterIndex =  group.items.length / 2 - 0.5;
  for (let i = 0; i < group.items.length; i++)
    group.items[i].center = group.avgRow + (group.items.indexOf(group.items[i]) - gRCenterIndex)*rowsPerCard;
}

function groupByAnkerPoint(blobs){
  // Iteratively find the two closest points and if they are within a certain distance, group them together
  // If one is already in a group, add the other to the same group, always keeping the original order

  const blobCards = blobs.map(blob => ({center: blob.ankerPoint, id: blob.id, title: blob.title, image: blob.image, info: blob.info}));

  const rowsPerCard = 5;

  const groups = [];

  while (true) {
    const pair = closestPair(blobCards);
    if (Math.abs(pair[0].center - pair[1].center) >= rowsPerCard) break;

    const group1 = groups.find(group => group.items.includes(pair[0]));
    const group2 = groups.find(group => group.items.includes(pair[1]));
    if (group1 && group2) {
      if (group1 !== group2) {
        // Merge groups keeping the original  card order
        group1.items = group1.items.concat(group2.items);
        groups.splice(groups.indexOf(group2), 1);
        group1.items.sort((a, b) => blobs.find(blob => blob.id === a.id).ankerPoint - blobs.find(blob => blob.id === b.id).ankerPoint);
        group1.avgRow = Math.floor(
          (
          Math.max(...group1.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
          +
          Math.min(...group1.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
          )/2
        );
        spaceCardsInGroup(group1);
        group1.tlength = group1.items.length * rowsPerCard;
        group1.head = group1.avgRow - Math.floor(group1.tlength / 2);
      }
    } else if (group1) {
      group1.items.push(pair[1]);
      group1.items.sort((a, b) => blobs.find(blob => blob.id === a.id).ankerPoint - blobs.find(blob => blob.id === b.id).ankerPoint);
      group1.avgRow = Math.floor(
        (
        Math.max(...group1.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        +
        Math.min(...group1.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        )/2
      );
      spaceCardsInGroup(group1);
      group1.tlength = group1.items.length * rowsPerCard;
      group1.head = group1.avgRow - Math.floor(group1.tlength / 2);
    } else if (group2) { 
      group2.items.push(pair[0]);
      group2.items.sort((a, b) => blobs.find(blob => blob.id === a.id).ankerPoint - blobs.find(blob => blob.id === b.id).ankerPoint);
      group2.avgRow = Math.floor(
        (
        Math.max(...group2.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        +
        Math.min(...group2.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        )/2
      );
      spaceCardsInGroup(group2);
      group2.tlength = group2.items.length * rowsPerCard;
      group2.head = group2.avgRow - Math.floor(group2.tlength / 2);
    } else {
      let newGroup = {items: pair};
      newGroup.avgRow = Math.floor(
        (
        Math.max(...newGroup.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        +
        Math.min(...newGroup.items.map(card => blobs.find(blob => blob.id === card.id).ankerPoint))
        )/2
      );
      newGroup.tlength = newGroup.items.length * rowsPerCard;
      newGroup.head = newGroup.avgRow - Math.floor(newGroup.tlength / 2);
      groups.push(newGroup);
      spaceCardsInGroup(newGroup);
    }
    blobCards.sort((a, b) => a.center - b.center);

  }

  // Add remaining blobs to groups
  for (let i = 0; i < blobCards.length; i++)
    if (!groups.some(group => group.items.includes(blobCards[i])))
      groups.push({items: [blobCards[i]], avgRow: blobCards[i].center, head: blobCards[i].center - Math.floor(rowsPerCard/2)});

  return groups;
}

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
  {
    id: 1,
    start: "2024-03",
    end: "2024-03",
    title: "L1",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 2,
    start: "2024-05",
    end: "2024-09",
    title: "L2",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 3,
    start: "2024-06",
    end: "2024-09",
    title: "L3",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 4,
    start: "2024-07",
    end: "2024-10",
    title: "L4",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 5,
    start: "2024-07",
    end: "2024-11",
    title: "L5",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 6,
    start: "2024-03",
    end: "2024-06",
    title: "L6",
    image: "../images/template.jpg",
    info: "info1",
  },
  {
    id: 7,
    start: "2024-03",
    end: "2024-05",
    title: "L7",
    image: "../images/template.jpg",
    info: "info1",
  },
];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const TimelineAxis = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = getMonthsBetween(start, end);
  const lanes = { left: NUM_LEFT_LANES, right: NUM_RIGHT_LANES };

  const totalRows = months.length * 2 - 1;
  const rowHeight = SPACING / 2;
  const rowTemplate = `repeat(${totalRows}, ${rowHeight}px)`;

  const laneOrder = [];
  if (lanes.left > 1) laneOrder.push("OL");
  laneOrder.push("CL");
  laneOrder.push("CR");
  if (lanes.right > 1) laneOrder.push("OR");

  // 1) build metadata for each event: startRow, endRow, length
  const blobsMeta = events
    .map((evt) => {
      const [sY, sM] = evt.start.split("-").map(Number);
      const [eY, eM] = evt.end.split("-").map(Number);
      const iStart = months.findIndex(
        (d) => d.getFullYear() === sY && d.getMonth() === sM-1,
      );
      const iEnd = months.findIndex(
        (d) => d.getFullYear() === eY && d.getMonth() === eM-1,
      );
      if (iStart < 0 || iEnd < 0) return null;
      const startRow = iStart * 2 + 1;
      const endRow = iStart === iEnd ? startRow + 2 : (iEnd) * 2 + 1;
      return {
        ...evt,
        startRow,
        endRow,
        isPoint: iStart === iEnd,
        length: endRow - startRow,
      };
    })
    .filter(Boolean);

  // 2) sort by descending length
  blobsMeta.sort((a, b) => b.length - a.length);

  // blobsMeta is the array of { id, startRow, endRow, length, ... }
  // Let n = blobsMeta.length
  const n = blobsMeta.length;
  for (let i = 0; i < blobsMeta.length; i++) blobsMeta[i].l_id = i;
  const M = Array.from({ length: n }, () => Array(n).fill(0));

  // Fill M[i][j] = fraction of blob i covered by blob j
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        M[i][j] = 0;
        continue;
      }
      const a = blobsMeta[i],
        b = blobsMeta[j];
      const overlapHeight = Math.max(
        0,
        Math.min(a.endRow, b.endRow) - Math.max(a.startRow, b.startRow),
      );
      M[i][j] = overlapHeight / a.length;
    }
  }

  // 3) prepare lane membership
  const laneMembers = { CL: [], CR: [], OL: [], OR: [] };
  const eventBlobs = [];

  // 5) fraction overlap of a by b
  function overlapFrac(a, b) {
    return M[a][b];
  }

  function laneOverlapConflict(blob, targetLane) {
    const currentLaneMembers = laneMembers[targetLane];
    const sumOv = currentLaneMembers.reduce(
      (sum, j) => sum + overlapFrac(blob, j),
      0,
    );
    return sumOv !== 0;
  }

  function laneCoverageConflict(blobs, targetLane) {
    const potentialLaneMembers = [...laneMembers[targetLane], ...blobs];
    if (targetLane.startsWith("O")) {
      const centerL = "C" + targetLane[1];
      const centerCovered = laneMembers[centerL].some((centerIdx) => {
        const coverSum = potentialLaneMembers.reduce(
          (sum, outerIdx) => sum + overlapFrac(centerIdx, outerIdx),
          0,
        );
        return coverSum >= 1;
      });
      if (centerCovered) return true;
    } else if (targetLane.startsWith("C")) {
      const outerL = "O" + targetLane[1];
      const centerCovered = potentialLaneMembers.some((centerIdx) => {
        const coverSum = laneMembers[outerL].reduce(
          (sum, outerIdx) => sum + overlapFrac(centerIdx, outerIdx),
          0,
        );
        return coverSum >= 1;
      });
      if (centerCovered) return true;
    }
    return false;
  }

  // 6) canPlace check = zero‐overlap + coverage‐sum rules
  function canPlace(blob, targetLane) {
    return (
      !laneOverlapConflict(blob, targetLane) &&
      !laneCoverageConflict([blob], targetLane)
    );
  }

  // 7) group‐push operation
  function tryMoveGroupElsewhere(conflictGroup, fromLane, conflictingBlob) {
    for (const targetLane of laneOrder) {
      if (targetLane === fromLane) continue;
      // can every member move into target simultaneously?
      if (conflictGroup.any((idx) => laneOverlapConflict(idx, targetLane)))
        continue;
      // would the move cause coverage conflict?
      if (laneCoverageConflict(conflictGroup, targetLane)) continue;
      // would the move allow the conflicting blob to be placed?
      if (laneCoverageConflict(conflictingBlob, targetLane)) continue;
      // commit the move
      for (const idx of conflictGroup) laneMembers[targetLane].push(idx);
      laneMembers[fromLane] = laneMembers[fromLane].filter(
        (idx) => !conflictGroup.includes(idx),
      );
      return true;
    }

    return false;
  }

  // 8) group‐swap: only if blob longer than all in C
  function tryGroupSwap(blob, conflictGroup, fromLane) {
    for (const targetLane of laneOrder) {
      if (targetLane === fromLane) continue;

      // 0) Check if blob can be stuffed in targetLane
      if (laneOverlapConflict(blob, targetLane)) continue;

      // 1) Identify secondary group D in targetLane overlapping C
      const conflictGroup2 = laneMembers[targetLane].filter((dIdx) =>
        conflictGroup.some((cIdx) => M[cIdx][dIdx] > 0),
      );
      conflictGroup2 = [...conflictGroup2, blob];

      const emptiedTargetMembers = laneMembers[targetLane].filter(
        (idx) => !conflictGroup2.includes(idx),
      );
      const emptiedFromMembers = laneMembers[fromLane].filter(
        (idx) => !conflictGroup.includes(idx),
      );

      // 2) Compute the would‑be new lane compositions
      const newTargetMembers = [
        // all existing members except those in D
        ...emptiedTargetMembers,
        // plus all of C
        ...conflictGroup,
      ];
      const newFromMembers = [...emptiedFromMembers, ...conflictGroup2];

      // --- Zero‑overlap checks on entire groups ---

      // 3) Zero‐overlap for C in newTargetMembers PROBABLY REDUNDANT
      const zeroOvC = conflictGroup.every((cIdx) =>
        emptiedTargetMembers.every((p) => M[cIdx][p] === 0),
      );
      if (!zeroOvC) continue;

      // 4) Zero‐overlap for D in newFromMembers
      const zeroOvD = conflictGroup2.every((dIdx) =>
        emptiedFromMembers.every((p) => M[dIdx][p] === 0),
      );
      if (!zeroOvD) continue;

      // --- Coverage rules on post‑swap lanes ---

      // 5) Moving C into targetLane: check no center blob fully covered
      if (targetLane.startsWith("O")) {
        // new outer lane is newTargetMembers
        const centerLane = "C" + targetLane[1];
        const centerLaneMembers = laneMembers[centerLane];
        if (centerLane === fromLane)
          centerLaneMembers = [...centerLaneMembers, ...conflictGroup2];

        // for each center blob, sum coverage by new outer lane
        const centerCovered = centerLaneMembers.some((centerIdx) => {
          const coverSum = newTargetMembers.reduce(
            (sum, cIdx) => sum + M[cIdx][centerIdx],
            0,
          );
          return coverSum >= 1;
        });
        if (centerCovered) continue;
      } else {
        // moving into CL/CR: new center lane is newTargetMembers
        const outerLane = "O" + targetLane[1];
        const outerLaneMembers = laneMembers[outerLane];
        if (outerLane === fromLane)
          outerLaneMembers = [...outerLaneMembers, ...conflictGroup2];

        const outerCovered = outerLaneMembers.some((outerIdx) => {
          const coverSum = newTargetMembers.reduce(
            (sum, cIdx) => sum + M[cIdx][outerIdx],
            0,
          );
          return coverSum >= 1;
        });
        if (outerCovered) continue;
      }

      // 6) Moving D into fromLane: check no center blob fully covered
      if (fromLane.startsWith("O")) {
        const centerLane = "C" + fromLane[1];
        const centerLaneMembers = laneMembers[centerLane];
        if (centerLane === targetLane)
          centerLaneMembers = [...centerLaneMembers, ...conflictGroup];

        const centerCovered = centerLaneMembers.some((centerIdx) => {
          const coverSum = newFromMembers.reduce(
            (sum, dIdx) => sum + M[dIdx][centerIdx],
            0,
          );
          return coverSum >= 1;
        });
        if (centerCovered) continue;
      } else {
        // moving into CL/CR: new center lane is newFromMembers

        const outerLane = "O" + fromLane[1];
        const outerLaneMembers = laneMembers[outerLane];
        if (outerLane === targetLane)
          outerLaneMembers = [...outerLaneMembers, ...conflictGroup];

        const outerCovered = outerLaneMembers.some((outerIdx) => {
          const coverSum = newFromMembers.reduce(
            (sum, dIdx) => sum + M[dIdx][outerIdx],
            0,
          );
          return coverSum >= 1;
        });
        if (outerCovered) continue;
      }

      // --- All checks passed: commit the swap ---
      laneMembers[targetLane] = newTargetMembers;
      laneMembers[fromLane] = newFromMembers;
      return true;
    }

    return false;
  }

  // 10) Main placement loop
  for (const blob of blobsMeta) {
    let placed = false;

    // 10.1 Simple zero-overlap
    for (const L of laneOrder) {
      if (canPlace(blob.l_id, L)) {
        laneMembers[L].push(blob.l_id);
        placed = true;
        console.log("placed", blob.id, "in", L);
        break;
      }
    }
    if (placed) continue;

    // 10.2 Conflict resolution on first conflicting lane
    for (const L of laneOrder) {
      if (!laneOverlapConflict(blob.l_id, L)) continue;
      const conflictGroup = laneMembers[L].filter(
        (idx) => overlapFrac(blob.l_id, idx) > 0,
      );

      // 10.2.1 Try group-push
      if (tryMoveGroupElsewhere(conflictGroup, L)) {
        // now place blob
        laneMembers[L].push(blob);
        placed = true;
        console.log("placed", blob.id, "in", L, "after group-push");
        break;
      }

      // 10.2.2 Try group-swap
      if (tryGroupSwap(blob, conflictGroup, L)) {
        placed = true;
        console.log("placed", blob.id, "in", L, "after group-swap");
        break;
      }
    }

    console.log("CL:", laneMembers["CL"].join(", "));
    console.log("CR:", laneMembers["CR"].join(", "));
    console.log("OL:", laneMembers["OL"].join(", "));
    console.log("OR:", laneMembers["OR"].join(", "));
    console.log("________");

    if (placed) continue;

    // 10.3 Single‐blob swap (optional, similar pattern)...
    console.warn("Could not place blob", blob.id);
  }
  
  function range(start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  const findBlobAnker = (blob) => {
    const blobLane = laneOrder.find((L) => laneMembers[L].includes(blob.l_id));
    if (!blobLane) return null;
    const centerRow = Math.floor((blob.startRow + blob.endRow) / 2);
    if (blobLane.startsWith("0")) return centerRow;
    // else: center lane, we need to find the uncovered section closer to the center
    const outerLane = "O" + blobLane[1];
    const conflictGroup = laneMembers[outerLane].filter(
      (idx) => overlapFrac(blob.l_id, idx) > 0,
    );
    const coveredRows = conflictGroup.flatMap((idx) =>
      range(
        Math.max(blobsMeta[idx].startRow, blob.startRow),
        Math.min(blobsMeta[idx].endRow, blob.endRow),
      ),
    );
    const uncoveredRows = range(blob.startRow, blob.endRow).filter(
      (row) => !coveredRows.includes(row),
    );
    const closestRow = uncoveredRows.reduce((prev, curr) =>
      Math.abs(curr - centerRow) < Math.abs(prev - centerRow) ? curr : prev,
    );
    return closestRow; //TODO: There is some kind of mismatch between startRow/endRow and the actual row number
  };

  blobsMeta.map((blob) => (blob.ankerPoint = findBlobAnker(blob)));


  const leftBlobs = blobsMeta.filter(
    (b) =>
      laneMembers["OL"].includes(b.l_id) || laneMembers["CL"].includes(b.l_id),
  );
  leftBlobs.sort((blobA, blobB) => blobA.ankerPoint - blobB.ankerPoint);
  const rightBlobs = blobsMeta.filter(
    (b) =>
      laneMembers["OR"].includes(b.l_id) || laneMembers["CR"].includes(b.l_id),
  );
  rightBlobs.sort((blobA, blobB) => blobA.ankerPoint - blobB.ankerPoint);

  const leftGroups = groupByAnkerPoint(leftBlobs);
  const rightGroups = groupByAnkerPoint(rightBlobs);

  // Function to calculate connection lines
  const calculateConnectionLines = () => {
    const connections = [];
    
    // Helper function to get blob position in the timeline
    const getBlobPosition = (blob) => {
      const blobLane = laneOrder.find((L) => laneMembers[L].includes(blob.l_id));
      let laneColumn;
      
      // Match the lane calculation from EventBlob rendering
      if (blobLane === "CL") laneColumn = lanes.left;
      else if (blobLane === "CR") laneColumn = lanes.left + 2;
      else if (blobLane === "OL") laneColumn = 1;
      else if (blobLane === "OR") laneColumn = lanes.left + 2 + 1;
      
      const centerRow = blob.ankerPoint || Math.floor((blob.startRow + blob.endRow) / 2);
      
      // Calculate position relative to extended SVG (250px offset + timeline position)
      const gridColumnPosition = (laneColumn - 1) * (40 + 8) +(89.875-(40))*Math.floor(laneColumn/3); // 40px column + 0.5rem gap (8px) HARDCODED TODO: make dynamic
      const blobCenterX = 250 + gridColumnPosition + 20; // SVG offset + grid position + half blob width
      const blobCenterY = (centerRow - 1) * (SPACING / 2) + (SPACING / 4); // Convert to actual pixel position
      
      return {
        x: blobCenterX,
        y: blobCenterY,
      };
    };

    // Helper function to get card center position
    const getCardPosition = (group, cardIndex, isLeft) => {
      const cardCenterRow = group.items[cardIndex].center;
      const cardY = (cardCenterRow - 1) * (SPACING / 2) + (SPACING / 4); // Match blob Y calculation
      
      // Calculate card center X position relative to extended SVG
      // Left cards: 250px (SVG extension) - 180px (card distance) + 90px (half card width)
      // Right cards: 250px (SVG extension) + timeline width + gap + 90px (half card width)
      const timelineWidth = (lanes.left + lanes.right + 1) * 40 + (lanes.left + lanes.right) * 8; // columns + gaps
      const cardCenterX = isLeft 
        ? 250 - 180 + 90  // 160px from left edge of extended SVG
        : 250 + timelineWidth + 32 + 90; // timeline + gap + half card width
      
      return { x: cardCenterX, y: cardY };
    };

    // Calculate connections for left side
    leftGroups.forEach((group) => {
      group.items.forEach((card, cardIndex) => {
        const blob = leftBlobs.find(b => b.id === card.id);
        if (blob) {
          const blobPos = getBlobPosition(blob);
          const cardPos = getCardPosition(group, cardIndex, true);
          
          console.log(`Left connection for blob ${blob.id}:`, {
            blobPos,
            cardPos,
            blobLane: laneOrder.find((L) => laneMembers[L].includes(blob.l_id)),
            ankerPoint: blob.ankerPoint
          });
          
          connections.push({
            id: `left-${blob.id}`,
            startX: cardPos.x,
            startY: cardPos.y,
            endX: blobPos.x,
            endY: blobPos.y,
          });
        }
      });
    });

    // Calculate connections for right side
    rightGroups.forEach((group) => {
      group.items.forEach((card, cardIndex) => {
        const blob = rightBlobs.find(b => b.id === card.id);
        if (blob) {
          const blobPos = getBlobPosition(blob);
          const cardPos = getCardPosition(group, cardIndex, false);
          
          console.log(`Right connection for blob ${blob.id}:`, {
            blobPos,
            cardPos,
            blobLane: laneOrder.find((L) => laneMembers[L].includes(blob.l_id)),
            ankerPoint: blob.ankerPoint
          });
          
          connections.push({
            id: `right-${blob.id}`,
            startX: blobPos.x,
            startY: blobPos.y,
            endX: cardPos.x,
            endY: cardPos.y,
          });
        }
      });
    });

    return connections;
  };

  const connectionLines = calculateConnectionLines();

  const sideLeftBlocks = leftGroups.map((group, i) => (
    <SideBlockGroupContainer key={`left-group-${i}`} startRow={group.head}>
      {group.items.map((blob) => (
        <SideBlock key={`blob-${blob.id}`}>
          <img src={blob.image} alt="" width={40} height={40} />
          <div>
            <div style={{ fontWeight: "bold" }}>{blob.title}</div>
            <div>{blob.info}</div>
            <button style={{ marginTop: "0.3rem", fontSize: "0.75rem" }}>
              More Info
            </button>
          </div>
        </SideBlock>
      ))}
    </SideBlockGroupContainer>
  ));

  const sideRightBlocks = rightGroups.map((group, i) => (
    <SideBlockGroupContainer key={`right-group-${i}`} startRow={group.head}>
      {group.items.map((blob) => (
        <SideBlock key={`blob-${blob.id}`}>
          <img src={blob.image} alt="" width={40} height={40} />
          <div>
            <div style={{ fontWeight: "bold" }}>{blob.title}</div>
            <div>{blob.info}</div>
            <button style={{ marginTop: "0.3rem", fontSize: "0.75rem" }}>
              More Info
            </button>
          </div>
        </SideBlock>
      ))}
    </SideBlockGroupContainer>
  ));

  // 11) Render event blobs
  for (const L of laneOrder)
    laneMembers[L].forEach((blobIdx) => {
      const blob = blobsMeta[blobIdx];

      eventBlobs.push(
        <EventBlob
          id={`event-${blob.id}`}
          key={blob.id}
          startRow={blob.startRow}
          endRow={blob.endRow}
          isPoint={blob.isPoint}
          rowHeight={SPACING}
          lane={
            L === "CL"
              ? lanes.left
              : L === "CR"
                ? lanes.left + 2
                : L === "OL"
                  ? 1
                  : lanes.left + 2 + 1
          }
        />,
      );
    });

  return (
    <MainLayout>
      <SideColumn rowTemplate={rowTemplate}>{sideLeftBlocks}</SideColumn>
      <TimelineWrapper style={{ gridTemplateRows: rowTemplate }} lanes={lanes}>
        <VerticalLine lanes={lanes} />

        {/* Connection lines */}
        <ConnectionContainer>
          <ConnectionSVG>
            {connectionLines.map((connection) => (
              <g key={connection.id}>
                {/* Connection line */}
                <line
                  x1={connection.startX}
                  y1={connection.startY}
                  x2={connection.endX}
                  y2={connection.endY}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  strokeDasharray="5,5"
                  style={{
                    color: `var(--bs-primary, #007bff)`,
                  }}
                />
                {/* Debug circles to show connection points */}
                <circle
                  cx={connection.startX}
                  cy={connection.startY}
                  r="3"
                  fill="red"
                  opacity="0.7"
                />
                <circle
                  cx={connection.endX}
                  cy={connection.endY}
                  r="3"
                  fill="blue"
                  opacity="0.7"
                />
              </g>
            ))}
          </ConnectionSVG>
        </ConnectionContainer>

        {months.flatMap((date, i) => {
          const isJanuary = date.getMonth() === 0;
          const keyBase = date.toISOString();

          const tickRow = (
            <Row key={`tick-${keyBase}`} lanes={lanes} id={i*2+1}>
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
              <Row key={`label-${keyBase}`} lanes={lanes} id={(i+1)*2}>
                <MonthLabel>{monthNames[date.getMonth()]}</MonthLabel>
              </Row>
            ) : null;

          return labelRow ? [tickRow, labelRow] : [tickRow];
        })}

        {eventBlobs}
      </TimelineWrapper>
      <SideColumn rowTemplate={rowTemplate}>{sideRightBlocks}</SideColumn>
    </MainLayout>
  );
};

TimelineAxis.propTypes = {
  startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
    .isRequired,
  endDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
    .isRequired,
};

export default TimelineAxis;
