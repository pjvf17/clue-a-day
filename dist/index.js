// src/index.ts
async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
var generateInteractiveCrossword = (answerLen, {
  cellSize = 50,
  cellColor = "#ffffff",
  focusColor = "#ffcc00"
} = {}) => {
  const rootStyles = getComputedStyle(document.documentElement);
  if (rootStyles.getPropertyValue("--cellSize")) cellSize = parseInt(rootStyles.getPropertyValue("--cellSize").trim());
  const svgNS = "http://www.w3.org/2000/svg";
  const xhtmlNS = "http://www.w3.org/1999/xhtml";
  const width = answerLen * cellSize;
  const height = cellSize;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  for (let i = 0; i < answerLen; i++) {
    const x = i * cellSize;
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", "0");
    rect.setAttribute("width", cellSize.toString());
    rect.setAttribute("height", cellSize.toString());
    rect.setAttribute("fill", cellColor);
    rect.setAttribute("stroke", "black");
    svg.appendChild(rect);
    const foreign = document.createElementNS(
      svgNS,
      "foreignObject"
    );
    foreign.setAttribute("x", x.toString());
    foreign.setAttribute("y", "0");
    foreign.setAttribute("width", cellSize.toString());
    foreign.setAttribute("height", cellSize.toString());
    const input = document.createElementNS(
      xhtmlNS,
      "input"
    );
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "1");
    input.classList.add("crossword-cell");
    input.setAttribute("id", `cell-${i}`);
    input.addEventListener("focus", () => {
      input.select();
      rect.setAttribute("fill", focusColor);
    });
    input.addEventListener("blur", () => {
      rect.setAttribute("fill", cellColor);
    });
    input.addEventListener("input", (e) => {
      const target = e.target;
      target.value = target.value.toUpperCase();
      const value = target.value;
      if (value.length === 1 && i < answerLen - 1) {
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        );
        nextCell?.focus();
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" && i < answerLen - 1) {
        e.preventDefault();
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        );
        nextCell?.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        const prevCell = document.getElementById(
          `cell-${i - 1}`
        );
        prevCell?.focus();
      }
    });
    foreign.appendChild(input);
    svg.appendChild(foreign);
  }
  const getUserInputHash = async () => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`);
      userAnswer += (cell?.value || "").toUpperCase();
    }
    return await digestMessage(userAnswer);
  };
  return { svg, getUserInputHash };
};
var compareHashes = async (getAnswerHash, getUserInputHash) => {
  const resultDiv = document.getElementById("result");
  const userInputHash = await getUserInputHash();
  const answerHash = await getAnswerHash();
  if (userInputHash === answerHash) {
    resultDiv.textContent = "\u2705 Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "\u274C Try Again.";
    resultDiv.style.color = "red";
  }
};
export {
  compareHashes,
  generateInteractiveCrossword
};
