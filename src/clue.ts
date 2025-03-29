// below taken from:
// https://gist.github.com/vaiorabbit/5657561
// import process from "node:process";
import "../src/style.scss";

export const fnv32a = (str: string) => {
  var FNV1_32A_INIT = 0x811c9dc5;
  var hval = FNV1_32A_INIT;
  for (var i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
};

export const generateInteractiveCrossword = (
  answerLen: number
): {
  container: HTMLDivElement;
  getUserInputHash: () => number;
  setLetter: (pos: number, c: string) => void;
  getActive: () => number;
  revealLetter: (answerBase64: string, pos: number | null) => void;
} => {
  const container = document.getElementById(
    "crossword-container"
  ) as HTMLDivElement;

  
  
    function getCell(index: number): HTMLInputElement | null {
      return document.getElementById(`cell-${index}`) as HTMLInputElement | null;
    }
    
    function focusNextCell(i: number, skip=true): number {
      let nextIndex = i;
      while (nextIndex < answerLen - 1) {
        nextIndex++;
        const cell = getCell(nextIndex);

        
        if (!skip || !cell?.classList.contains("revealed-letter")) {
          break;
        }
      }
      getCell(nextIndex)?.focus();
      return nextIndex;
    }
    
    function focusPrevCell(i: number, skip=true): number {
      let prevIndex = i;
      while (prevIndex > 0) {
        prevIndex--;
        const cell = getCell(prevIndex);
        if (!skip || !cell?.classList.contains("revealed-letter")) {
          break;
        }
      }
      getCell(prevIndex)?.focus();
      return prevIndex;
    }

    for (let i = 0; i < answerLen; i++) {
      
      const rect = document.createElement("div");
      rect.className = "crossword-cell";
      container.appendChild(rect);

      const input = document.createElement("input") as HTMLInputElement;
      input.type = "text";
      
      input.classList.add("crossword-cell-input");
      input.id = `cell-${i}`;
      rect.appendChild(input);

      
      input.addEventListener("focus", () => {
        const previousActive = document.querySelector(".active-cell") as HTMLInputElement | null;
        if (previousActive && previousActive !== input) {
          previousActive.classList.remove("active-cell");
        }
        input.classList.add("active-cell");
      });

      
      input.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value.toUpperCase();

        if (input.classList.contains("revealed-letter")) {
          target.value = value.charAt(0);
          focusNextCell(i);
          return;
        }

        if (value.length > 0) {
          target.value = value.charAt(value.length - 1);
          focusNextCell(i);
        }
      });

      
      input.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          focusNextCell(i, false);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          focusPrevCell(i, false);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          if (input.value === "") {
            const prevCell = getCell(focusPrevCell(i, false));
            if (prevCell && !prevCell?.classList.contains("revealed-letter")) {
              prevCell.value = "";
            }
          } else if (!input.classList.contains("revealed-letter")) {
            input.value = "";
          }
          focusPrevCell(i, false)
        }
      });
    }



  const getUserInputHash = (): number => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`) as HTMLInputElement;
      userAnswer += (cell?.value || "").toUpperCase();
    }
    return fnv32a(userAnswer);
  };

  const setLetter = (pos: number, c: string) => {
    const cell = document.getElementById(`cell-${pos}`) as HTMLInputElement;
    cell.value = c;
    cell.focus();
    cell.classList.add("revealed-letter");
  };

  const getActive = (): number => {
    const active = document.querySelector(
      ".active-cell"
    ) as HTMLInputElement | null;
    if (!active) return -1;

    const allInputs = Array.from(document.querySelectorAll("input"));
    return allInputs.indexOf(active);
  };

  const revealLetter = (answerBase64: string, pos: number | null) => {
    const decoded = atob(answerBase64);

    if (!pos) pos = getActive();

    if (pos < 0 || pos >= decoded.length) {
      throw new Error("Position out of bounds");
    }

    const c = decoded.charAt(pos);

    setLetter(pos, c);
  };

  return { container, getUserInputHash, setLetter, getActive, revealLetter };
};

export const compareHashes = (
  getAnswerHash: () => number,
  getUserInputHash: () => number
) => {
  const resultDiv = document.getElementById("result") as HTMLElement;
  const answerHash = getAnswerHash();
  const userInputHash = getUserInputHash();
  if (userInputHash === answerHash) {
    resultDiv.textContent = "✅ Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "❌ Try Again.";
    resultDiv.style.color = "red";
  }
};
