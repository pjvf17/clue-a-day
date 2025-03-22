function generateInteractiveCrossword(word, cellSize = 50) {
   const svgNS = "http://www.w3.org/2000/svg";
   const xhtmlNS = "http://www.w3.org/1999/xhtml";
   const width = word.length * cellSize;
   const height = cellSize;

   const svg = document.createElementNS(svgNS, "svg");
   svg.setAttribute("width", width);
   svg.setAttribute("height", height);

   for (let i = 0; i < word.length; i++) {
     const x = i * cellSize;

     // Cell border
     const rect = document.createElementNS(svgNS, "rect");
     rect.setAttribute("x", x);
     rect.setAttribute("y", 0);
     rect.setAttribute("width", cellSize);
     rect.setAttribute("height", cellSize);
     rect.setAttribute("fill", "#516770");
     rect.setAttribute("stroke", "black");
     svg.appendChild(rect);

     // Input box
     const foreign = document.createElementNS(svgNS, "foreignObject");
     foreign.setAttribute("x", x);
     foreign.setAttribute("y", 0);
     foreign.setAttribute("width", cellSize);
     foreign.setAttribute("height", cellSize);

     const input = document.createElementNS(xhtmlNS, "input");
     input.setAttribute("type", "text");
     input.setAttribute("maxlength", "1");
     input.classList.add("crossword-cell");
     input.setAttribute("id", `cell-${i}`);
     input.addEventListener("focus", () => {
       input.select();
       rect.setAttribute("fill", "#48213f");
     });
     input.addEventListener("blur", () => {
       rect.setAttribute("fill", "#516770");
     });

     // Auto move to next cell
     input.addEventListener("input", (e) => {
       e.target.value = e.target.value.toUpperCase();
       const value = e.target.value;
       if (value.length === 1 && i < word.length - 1) {
         document.getElementById(`cell-${i + 1}`).focus();
       }
     });

     input.addEventListener("keydown", (e) => {
       if (e.key === "ArrowRight" && i < word.length - 1) {
         e.preventDefault();
         document.getElementById(`cell-${i + 1}`).focus();
       } else if (e.key === "ArrowLeft" && i > 0) {
         e.preventDefault();
         document.getElementById(`cell-${i - 1}`).focus();
       }
     });


     foreign.appendChild(input);
     svg.appendChild(foreign);
   }

   return svg;
 }

 const container = document.getElementById("crossword-container");
 const crossword = generateInteractiveCrossword("HELLO");
 container.appendChild(crossword);

 const correctAnswer = "HELLO";

document.getElementById("submit-button").addEventListener("click", () => {
  let userAnswer = "";
  for (let i = 0; i < correctAnswer.length; i++) {
    const cell = document.getElementById(`cell-${i}`);
    userAnswer += (cell.value || "").toUpperCase();
  }

  const resultDiv = document.getElementById("result");
  if (userAnswer === correctAnswer) {
    resultDiv.textContent = "✅ Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "❌ Try Again.";
    resultDiv.style.color = "red";
  }
});
