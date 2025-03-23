const cellColor = "#516770";
const focusColor = "#695170";

function generateInteractiveCrossword(wordLen: number, cellSize: number = 50): SVGSVGElement {
  const svgNS = "http://www.w3.org/2000/svg";
  const xhtmlNS = "http://www.w3.org/1999/xhtml";
  const width = wordLen * cellSize;
  const height = cellSize;
   
  const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());

  for (let i = 0; i < wordLen; i++) {
    const x = i * cellSize;

    // Cell border
    const rect = document.createElementNS(svgNS, "rect") as SVGRectElement;
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", "0");
    rect.setAttribute("width", cellSize.toString());
    rect.setAttribute("height", cellSize.toString());
    rect.setAttribute("fill", cellColor);
    rect.setAttribute("stroke", "black");
    svg.appendChild(rect);

    // Input box
    const foreign = document.createElementNS(svgNS, "foreignObject") as SVGForeignObjectElement;
    foreign.setAttribute("x", x.toString());
    foreign.setAttribute("y", "0");
    foreign.setAttribute("width", cellSize.toString());
    foreign.setAttribute("height", cellSize.toString());

    const input = document.createElementNS(xhtmlNS, "input") as HTMLInputElement;
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

    input.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.toUpperCase();
      const value = target.value;
      if (value.length === 1 && i < wordLen - 1) {
        const nextCell = document.getElementById(`cell-${i + 1}`) as HTMLInputElement;
        nextCell?.focus();
      }
    });

    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && i < wordLen - 1) {
        e.preventDefault();
        const nextCell = document.getElementById(`cell-${i + 1}`) as HTMLInputElement;
        nextCell?.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        const prevCell = document.getElementById(`cell-${i - 1}`) as HTMLInputElement;
        prevCell?.focus();
      }
    });

    foreign.appendChild(input);
    svg.appendChild(foreign);
  }

  return svg;
}

const container = document.getElementById("crossword-container");
const crossword = generateInteractiveCrossword(8);
container?.appendChild(crossword);

const correctAnswer = "HELLO";

const submitButton = document.getElementById("submit-button");
submitButton?.addEventListener("click", () => {
  let userAnswer = "";
  for (let i = 0; i < correctAnswer.length; i++) {
    const cell = document.getElementById(`cell-${i}`) as HTMLInputElement;
    userAnswer += (cell?.value || "").toUpperCase();
  }

  const resultDiv = document.getElementById("result") as HTMLElement;
  if (userAnswer === correctAnswer) {
    resultDiv.textContent = "✅ Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "❌ Try Again.";
    resultDiv.style.color = "red";
  }
});