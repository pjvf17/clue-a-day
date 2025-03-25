async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

function fnv32a( str:string )
{
	var FNV1_32A_INIT = 0x811c9dc5;
	var hval = FNV1_32A_INIT;
	for ( var i = 0; i < str.length; ++i )
	{
		hval ^= str.charCodeAt(i);
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	return hval >>> 0;
}
export const generateInteractiveCrossword = (
  answerLen: number,
  {
    cellSize = 50,
    cellColor = "#ffffff",
    focusColor = "#ffcc00",
  }: {
    cellSize?: number;
    cellColor?: string;
    focusColor?: string;
  } = {}
): { svg: SVGSVGElement; getUserInputHash: () => number } => {
  const rootStyles = getComputedStyle(document.documentElement);
  if (rootStyles.getPropertyValue("--cellSize"))
    cellSize = parseInt(rootStyles.getPropertyValue("--cellSize").trim());
  const svgNS = "http://www.w3.org/2000/svg";
  const xhtmlNS = "http://www.w3.org/1999/xhtml";
  const width = answerLen * cellSize;
  const height = cellSize;

  const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());

  for (let i = 0; i < answerLen; i++) {
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
    const foreign = document.createElementNS(
      svgNS,
      "foreignObject"
    ) as SVGForeignObjectElement;
    foreign.setAttribute("x", x.toString());
    foreign.setAttribute("y", "0");
    foreign.setAttribute("width", cellSize.toString());
    foreign.setAttribute("height", cellSize.toString());

    const input = document.createElementNS(
      xhtmlNS,
      "input"
    ) as HTMLInputElement;
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
          prevCell.value = ""
        } else {
          curCell.value = ""
        }
      }
    });

    foreign.appendChild(input);
    svg.appendChild(foreign);
  }

  const getUserInputHash = ():number => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`) as HTMLInputElement;
      userAnswer += (cell?.value || "").toUpperCase();
    }
    return fnv32a(userAnswer);
  };

  return { svg, getUserInputHash };
};

const container = document.getElementById("crossword-container");
const crossword = generateInteractiveCrossword(8, {
  cellColor: "#516770",
  focusColor: "#695170",
});
container?.appendChild(crossword.svg);

const submitButton = document.getElementById("submit-button");

export const compareHashes = (
  answerHash: () => string,
  userInputHash: () => string
) => {
  const resultDiv = document.getElementById("result") as HTMLElement;
  if (userInputHash === answerHash) {
    resultDiv.textContent = "✅ Correct!";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = "❌ Try Again.";
    resultDiv.style.color = "red";
  }
};

// const getAnswerHash = async () => await digestMessage("HELLO")

// submitButton?.addEventListener("click", () => compareHashes(getAnswerHash));
