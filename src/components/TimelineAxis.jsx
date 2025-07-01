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
  transform: translateY(-${3*SPACING / 4}px);
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
  { id: 2, start: "2024-05", end: "2024-09" },
  { id: 3, start: "2024-06", end: "2024-09" },
  { id: 4, start: "2024-07", end: "2024-10" }, // 3rd layer
  { id: 5, start: "2024-07", end: "2024-11" }, // 4th layer
  { id: 6, start: "2024-03", end: "2024-06" }, // 4th layer
  { id: 7, start: "2024-03", end: "2024-05" }, // 4th layer
];

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const TimelineAxis = ({ startDate, endDate }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = getMonthsBetween(start, end);
  const lanes = { left: NUM_LEFT_LANES, right: NUM_RIGHT_LANES };

  const totalRows = months.length * 2 - 1;
  const rowHeight = SPACING / 2;
  const rowTemplate = `repeat(${totalRows}, ${rowHeight}px)`;
  const laneOrder = ["CL","CR","OL","OR"];

  // 1) build metadata for each event: startRow, endRow, length
  const blobsMeta = events.map(evt => {
    const [sY, sM] = evt.start.split("-").map(Number);
    const [eY, eM] = evt.end  .split("-").map(Number);
    const iStart = months.findIndex(d=>d.getFullYear()===sY && d.getMonth()===sM);
    const iEnd   = months.findIndex(d=>d.getFullYear()===eY && d.getMonth()===eM);
    if (iStart<0||iEnd<0) return null;
    const startRow = iStart*2 + 1;
    const endRow   = iStart===iEnd
                     ? startRow+1
                     : (iEnd+1)*2 + 1;
    return {
      ...evt,
      startRow, endRow,
      isPoint: iStart===iEnd,
      length: endRow - startRow
    };
  }).filter(Boolean);

  // 2) sort by descending length
  blobsMeta.sort((a,b)=> b.length - a.length);

  // blobsMeta is the array of { id, startRow, endRow, length, ... }
  // Let n = blobsMeta.length
  const n = blobsMeta.length;
  for (let i = 0; i < blobsMeta.length; i++)
    blobsMeta[i].l_id = i;
  const M = Array.from({ length: n }, () => Array(n).fill(0));

  // Fill M[i][j] = fraction of blob i covered by blob j
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        M[i][j] = 0; 
        continue;
      }
      const a = blobsMeta[i], b = blobsMeta[j];
      const overlapHeight = Math.max(
        0,
        Math.min(a.endRow, b.endRow) - Math.max(a.startRow, b.startRow)
      );
      M[i][j] = overlapHeight / a.length;
    }
  }

  console.log(M);

  // 3) prepare lane membership
  const laneMembers = { CL: [], CR: [], OL: [], OR: [] };
  const eventBlobs = [];
  
  // 5) fraction overlap of a by b
  function overlapFrac(a,b){
    return M[a,b]
  }

  // 6) canPlace check = zero‐overlap + coverage‐sum rules
  function canPlace(idx, L) {
    const members = laneMembers[L];  // array of blob‐indexes
    // 1) zero‐overlap sum
    const sumOv = members.reduce(
      (sum, j) => sum + M[idx][j] + M[j][idx], //REDUNDANT? one direction should be enough
      0
    );
    if (sumOv !== 0) return false;

    // 2) coverage‐sum rules
    const newLaneMembers = [...members, idx];
    if (L === "OL" || L === "OR") {
      const centerL = L === "OL" ? "CL" : "CR";
      const centerCovered = laneMembers[centerL].some(centerIdx => {
        const coverSum = newLaneMembers
          .reduce((sum, dIdx) => sum + M[centerIdx][dIdx], 0);
        return coverSum >= 1;
      });
      console.log(idx, " sumCov1: ");
      if (centerCovered) return false;
    }
    if (L === "CL" || L === "CR") {
      const outerL = L === "CL" ? "OL" : "OR";
      const sumCov = laneMembers[outerL].reduce(
        (sum, j) => sum + M[idx][j],
        0
      );
      console.log(idx, " sumCov2: ", sumCov);
      if (sumCov >= 1) return false;
    }

    return true;
  }


  // 7) group‐push operation
  function tryGroupPush(C, fromLane){
    for(const target of laneOrder){
      if(target === fromLane) continue;
      // every member can move into target?
      const ok = C.every(c => canPlace(c, target));
      if(ok){
        C.forEach(c=>{
          laneMembers[fromLane] = laneMembers[fromLane].filter(x=>x!==c);
          laneMembers[target].push(c);
        });
        return true;
      }
    }
    return false;
  }

  // 8) group‐swap: only if blob longer than all in C
  function tryGroupSwap(blob, C, fromLane) {
    const laneOrder = ["CL","CR","OL","OR"];

    for (const targetLane of laneOrder) {
      if (targetLane === fromLane) continue;

      // 0) Check if blob can be placed in targetLane
      if (!canPlace(blob, targetLane)) continue;

      // 1) Identify secondary group D in targetLane overlapping C
      const D = laneMembers[targetLane].filter(dIdx =>
        C.some(c => M[c][dIdx] + M[dIdx][c] > 0)
      );
      if (D.length === 0) continue;

      const emptiedTargetMembers = laneMembers[targetLane].filter(
        idx => !D.includes(idx)
      )
      const emptiedFromMembers = laneMembers[fromLane].filter(
        idx => !C.includes(idx)
      )

      // 2) Compute the would‑be new lane compositions
      const newTargetMembers = [
        // all existing members except those in D
        ...emptiedTargetMembers,
        // plus all of C
        ...C, 
        // plus the blob
        blob
      ];
      const newFromMembers = [
        ...emptiedFromMembers,
        ...D
      ];

      // --- Zero‑overlap checks on entire groups ---

      // 3) Zero‐overlap for C in newTargetMembers
      const zeroOvC = C.every(c =>
        emptiedTargetMembers.every(p => (M[c][p] + M[p][c]) === 0)
      );
      if (!zeroOvC) continue;

      // 4) Zero‐overlap for D in newFromMembers
      const zeroOvD = D.every(dIdx =>
        emptiedFromMembers.every(p => (M[dIdx][p] + M[p][dIdx]) === 0)
      );
      if (!zeroOvD) continue;

      // --- Coverage rules on post‑swap lanes ---

      // 5) Moving C into targetLane: check no center blob fully covered
      if (targetLane === "OL" || targetLane === "OR") {
        // new outer lane is newTargetMembers
        const centerLane = targetLane === "OL" ? "CL" : "CR";
        // for each center blob, sum coverage by new outer lane
        const centerCovered = laneMembers[centerLane].some(centerIdx => {
          const coverSum = newTargetMembers
            .reduce((sum, cIdx) => sum + M[cIdx][centerIdx], 0);
          return coverSum >= 1;
        });
        if (centerCovered) continue;
      } else {
        // moving into CL/CR: new center lane is newTargetMembers
        const outerLane = targetLane === "CL" ? "OL" : "OR";
        const outerCovered = laneMembers[outerLane].some(outerIdx => {
          const coverSum = newTargetMembers
            .reduce((sum, cIdx) => sum + M[cIdx][outerIdx], 0);
          return coverSum >= 1;
        });
        if (outerCovered) continue;
      }

      // 6) Moving D into fromLane: check no center blob fully covered
      if (fromLane === "OL" || fromLane === "OR") {
        // new outer lane is newFromMembers
        const centerLane = fromLane === "OL" ? "CL" : "CR";
        const centerCovered = laneMembers[centerLane].some(centerIdx => {
          const coverSum = newFromMembers
            .reduce((sum, dIdx) => sum + M[dIdx][centerIdx], 0);
          return coverSum >= 1;
        });
        if (centerCovered) continue;
      } else {
        // moving into CL/CR: new center lane is newFromMembers
        const outerLane = fromLane === "CL" ? "OL" : "OR";
        const outerCovered = laneMembers[outerLane].some(outerIdx => {
          const coverSum = newFromMembers
            .reduce((sum, dIdx) => sum + M[dIdx][outerIdx], 0);
          return coverSum >= 1;
        });
        if (outerCovered) continue;
      }

      // --- All checks passed: commit the swap ---
      laneMembers[targetLane] = newTargetMembers;
      laneMembers[fromLane]   = newFromMembers;
      return true;
    }

    return false;
  }


  // 9) recursive placement helper for back‑placing swaps
  function placeBlob(blob){
    for(const L of laneOrder){
      if(canPlace(blob.l_id,L)){
        laneMembers[L].push(blob);
        eventBlobs.push(
          <EventBlob
            key={blob.id}
            startRow={blob.startRow}
            endRow={blob.endRow}
            isPoint={blob.isPoint}
            rowHeight={SPACING}
            lane={ (L==="CL"? lanes.left : L==="CR"? lanes.left+2 : L==="OL"? 1 : lanes.left+2+1) }
          />
        );
        return true;
      }
    }
    return false;
  }

  // 10) Main placement loop
  for(const blob of blobsMeta){
    let placed = false;

    // 10.1 Simple zero-overlap
    for(const L of laneOrder){
      if(canPlace(blob.l_id, L)){
        laneMembers[L].push(blob.l_id);
        placed = true;
        console.log("placed", blob.id, "in", L );
        break;
      }
    }
    if(placed) continue;

    // 10.2 Conflict resolution on first conflicting lane
    for(const L of laneOrder){
      const C = laneMembers[L].filter(m => overlapFrac(blob,m)+overlapFrac(m,blob)>0);
      if(C.length===0) continue;

      // 10.2.1 Try group-push
      if(tryGroupPush(C, L)){
        // now place blob
        laneMembers[L].push(blob);
        placed = true;
        console.log("placed", blob.id, "in", L, "after group-push");
        break;
      }

      // 10.2.2 Try group-swap
      if(tryGroupSwap(blob, C, L)){
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
    
    if(placed) continue;

    // 10.3 Single‐blob swap (optional, similar pattern)...
    console.warn("Could not place blob", blob.id);
  }

  // 11) Render event blobs
  for(const L of laneOrder)
    laneMembers[L].forEach(blobIdx =>
      eventBlobs.push(
        <EventBlob
          key={blobsMeta[blobIdx].id}
          startRow={blobsMeta[blobIdx].startRow}
          endRow={blobsMeta[blobIdx].endRow}
          isPoint={blobsMeta[blobIdx].isPoint}
          rowHeight={SPACING}
          lane={ (L==="CL"? lanes.left : L==="CR"? lanes.left+2 : L==="OL"? 1 : lanes.left+2+1) }
          />
      )
    );

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

      {eventBlobs}
      
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
