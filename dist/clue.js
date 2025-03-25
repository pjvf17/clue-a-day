// src/index.ts
var fnv32a = (str) => {
  var FNV1_32A_INIT = 2166136261;
  var hval = FNV1_32A_INIT;
  for (var i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
};
var generateInteractiveCrossword = (answerLen, {
  cellColor = "#516770",
  focusColor = "#695170"
} = {}) => {
  const container = document.getElementById(
    "crossword-container"
  );
  for (let i = 0; i < answerLen; i++) {
    const rect = document.createElement("div");
    container.appendChild(rect);
    rect.className = "crossword-cell";
    rect.style.backgroundColor = cellColor;
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "1");
    input.classList.add("crossword-cell-input");
    input.setAttribute("id", `cell-${i}`);
    input.addEventListener("focus", () => {
      input.select();
      rect.style.backgroundColor = focusColor;
    });
    input.addEventListener("blur", () => {
      rect.style.backgroundColor = cellColor;
    });
    input.addEventListener("input", (e) => {
      const target = e.target;
      target.value = target.value.toUpperCase();
      const value = target.value;
      if (value.length === 1 && i < answerLen - 1) {
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        );
        nextCell == null ? void 0 : nextCell.focus();
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" && i < answerLen - 1) {
        e.preventDefault();
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        );
        nextCell == null ? void 0 : nextCell.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        const prevCell = document.getElementById(
          `cell-${i - 1}`
        );
        prevCell == null ? void 0 : prevCell.focus();
      } else if (e.key === "Backspace" && i > 0) {
        e.preventDefault();
        const curCell = document.getElementById(
          `cell-${i}`
        );
        if (curCell.value == "") {
          const prevCell = document.getElementById(
            `cell-${i - 1}`
          );
          prevCell == null ? void 0 : prevCell.focus();
          prevCell.value = "";
        } else {
          curCell.value = "";
        }
      }
    });
    rect.appendChild(input);
  }
  const getUserInputHash = () => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`);
      userAnswer += ((cell == null ? void 0 : cell.value) || "").toUpperCase();
    }
    return fnv32a(userAnswer);
  };
  return { container, getUserInputHash };
};
var compareHashes = (getAnswerHash, getUserInputHash) => {
  const resultDiv = document.getElementById("result");
  const answerHash = getAnswerHash();
  const userInputHash = getUserInputHash();
  if (userInputHash === answerHash) {
    resultDiv.textContent = "\u2705 Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "\u274C Try Again.";
    resultDiv.style.color = "red";
  }
};
console.log("moose");
export {
  compareHashes,
  fnv32a,
  generateInteractiveCrossword
};
