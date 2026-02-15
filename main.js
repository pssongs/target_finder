// main.js

if (typeof hashDB === "undefined") {
  throw new Error("hashDB not found. Ensure data.js loads before main.js.");
}

const keyInput = document.getElementById("keyInput");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");

// 🔹 Set YOUR current location here
const MY_LOCATION = "BG 90000 90000";
const LOCATION_TWO = "BG 80000 80000";

searchBtn.addEventListener("click", lookupValue);
keyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") lookupValue();
});

/*
  Converts "BG 97651 89703" → numeric { x, y }
  Rule:
    - Second letter increments latitude by +100,000 per letter
    - Base second letter = "G"
*/
function parseCoord(coordStr) {
  const cleaned = String(coordStr).replace(/\s+/g, "").toUpperCase();

  // Expect: 2 letters + 10 digits
  const match = cleaned.match(/^([A-Z]{2})(\d{5})(\d{5})$/);
  if (!match) return null;

  const letters = match[1];
  let x = parseInt(match[2], 10);
  let y = parseInt(match[3], 10);

  const base = "G".charCodeAt(0);

  // First letter increments X
  const firstLetter = letters.charAt(0);
  const firstLetterSteps = firstLetter.charCodeAt(0) - base;
  x += firstLetterSteps * 100000;

  // Second letter increments Y
  const secondLetter = letters.charAt(1);
  const secondLetterSteps = secondLetter.charCodeAt(0) - base;
  y += secondLetterSteps * 100000;

  return { x: x, y: y };
}

// Returns straight-line distance only
function calculateDistance(fromCoordStr, toCoordStr) {
  const from = parseCoord(fromCoordStr);
  const to = parseCoord(toCoordStr);

  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function lookupValue() {
  // Normalize input
    const key = keyInput.value.replace(/\s+/g, "").toUpperCase();
    resultDiv.classList.remove("ok", "bad");

  // Validate format: 2 letters + 10 digits
  const isValidFormat = /^([A-Z]{2})(\d{5})(\d{5})$/.test(key);
  if (!isValidFormat) {
    resultDiv.textContent = "입력 형식 오류 (예: BG 90000 90000)";
    resultDiv.classList.add("bad");
    return;
  }

  const distance = calculateDistance(MY_LOCATION, key);
  const distanceTwo = calculateDistance(LOCATION_TWO, key);

  if (hashDB.has(key)) {
    const value = hashDB.get(key);

    if (distance !== null) {
      resultDiv.textContent =
        value + " | 주둔지 사거리: " + Math.round(distance) + "m | 추진진지 사거리: " + Math.round(distanceTwo) + "m";
    } else {
      resultDiv.textContent = value;
    }

    resultDiv.classList.add("ok");
  } else {
    resultDiv.textContent = "임기표적 | 주둔지 사거리: " + Math.round(distance) + "m | 추진진지 사거리: " + Math.round(distanceTwo) + "m";
    resultDiv.classList.add("bad");
  }
}
