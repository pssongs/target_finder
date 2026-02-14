// main.js

if (typeof hashDB === "undefined") {
  throw new Error("hashDB not found. Ensure data.js loads before main.js.");
}

const keyInput = document.getElementById("keyInput");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");

// 🔹 Set YOUR current location here
const MY_LOCATION = "BG 90000 90000";

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
  const x = parseInt(match[2], 10);
  let y = parseInt(match[3], 10);

  const secondLetter = letters.charAt(1);
  const base = "G".charCodeAt(0);
  const current = secondLetter.charCodeAt(0);

  const letterSteps = current - base;
  y += letterSteps * 100000;

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
    const distance = calculateDistance(MY_LOCATION, key);
    resultDiv.classList.remove("ok", "bad");

  if (hashDB.has(key)) {
    const value = hashDB.get(key);

    if (distance !== null) {
      resultDiv.textContent =
        value + " | 사거리: " + Math.round(distance) + "m";
    } else {
      resultDiv.textContent = value;
    }

    resultDiv.classList.add("ok");
  } else {
    resultDiv.textContent = "임기표적 | 사거리: " + Math.round(distance)
    resultDiv.classList.add("bad");
  }
}
