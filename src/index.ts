// below taken from:
// https://gist.github.com/vaiorabbit/5657561
export const fnv32a = (str: string) => {
  var FNV1_32A_INIT = 0x811c9dc5;
  var hval = FNV1_32A_INIT;
  for (var i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

export const generateInteractiveCrossword = (
  answerLen: number,
  {
    cellColor = "#516770",
    focusColor = "#695170",
  }: {
    cellColor?: string;
    focusColor?: string;
  } = {}
): { container: HTMLDivElement, getUserInputHash: () => number } => {

  const container = document.getElementById(
    "crossword-container"
  ) as HTMLDivElement;

  for (let i = 0; i < answerLen; i++) {

    const rect = document.createElement("div");
    container.appendChild(rect);
    rect.className = "crossword-cell";
    rect.style.backgroundColor = cellColor;

    const input = document.createElement("input") as HTMLInputElement;
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

    input.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.toUpperCase();
      const value = target.value;
      if (value.length === 1 && i < answerLen - 1) {
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        ) as HTMLInputElement;
        nextCell?.focus();
      }
    });

    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && i < answerLen - 1) {
        e.preventDefault();
        const nextCell = document.getElementById(
          `cell-${i + 1}`
        ) as HTMLInputElement;
        nextCell?.focus();
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        const prevCell = document.getElementById(
          `cell-${i - 1}`
        ) as HTMLInputElement;
        prevCell?.focus();
      } else if (e.key === "Backspace" && i > 0) {
        e.preventDefault();
        const curCell = document.getElementById(
          `cell-${i}`
        ) as HTMLInputElement;
        if (curCell.value == "") {
          const prevCell = document.getElementById(
            `cell-${i - 1}`
          ) as HTMLInputElement;
          prevCell?.focus();
          prevCell.value = "";
        } else {
          curCell.value = "";
        }
      }
    });
    rect.appendChild(input);
  }

  const getUserInputHash = ():number => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`) as HTMLInputElement;
      userAnswer += (cell?.value || "").toUpperCase();
    }
    return fnv32a(userAnswer);
  };

  return { container, getUserInputHash };
};


export const compareHashes = (
  getAnswerHash: () => number,
  getUserInputHash: () => number
) => {
  const resultDiv = document.getElementById("result") as HTMLElement;
  const answerHash = getAnswerHash()
  const userInputHash = getUserInputHash()
  if (userInputHash === answerHash) {
    resultDiv.textContent = "✅ Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "❌ Try Again.";
    resultDiv.style.color = "red";
  }
};
