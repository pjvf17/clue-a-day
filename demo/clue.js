var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/style.scss
var require_ = __commonJS({
  "src/style.scss"(exports, module) {
    module.exports = {};
  }
});

// src/clue.ts
if (true === "true") {
  Promise.resolve().then(() => __toESM(require_())).then(() => {
    console.log("Development styles loaded.");
  }).catch((error) => {
    console.error("Failed to load styles:", error);
  });
}
var fnv32a = (str) => {
  var FNV1_32A_INIT = 2166136261;
  var hval = FNV1_32A_INIT;
  for (var i = 0; i < str.length; ++i) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
};
var generateInteractiveCrossword = (answerLen) => {
  const container = document.getElementById(
    "crossword-container"
  );
  function getCell(index) {
    return document.getElementById(`cell-${index}`);
  }
  function focusNextCell(i, skip = true) {
    var _a;
    let nextIndex = i;
    while (nextIndex < answerLen - 1) {
      nextIndex++;
      const cell = getCell(nextIndex);
      if (!skip || !(cell == null ? void 0 : cell.classList.contains("revealed-letter")) || !(cell == null ? void 0 : cell.classList.contains("confirmed-letter"))) {
        break;
      }
    }
    (_a = getCell(nextIndex)) == null ? void 0 : _a.focus();
    return nextIndex;
  }
  function focusPrevCell(i, skip = true) {
    var _a;
    let prevIndex = i;
    while (prevIndex > 0) {
      prevIndex--;
      const cell = getCell(prevIndex);
      if (!skip || !(cell == null ? void 0 : cell.classList.contains("revealed-letter")) || !(cell == null ? void 0 : cell.classList.contains("confirmed-letter"))) {
        break;
      }
    }
    (_a = getCell(prevIndex)) == null ? void 0 : _a.focus();
    return prevIndex;
  }
  for (let i = 0; i < answerLen; i++) {
    const rect = document.createElement("div");
    rect.className = "crossword-cell";
    container.appendChild(rect);
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("crossword-cell-input");
    input.id = `cell-${i}`;
    rect.appendChild(input);
    const revealButton = document.getElementById(
      "reveal-button"
    );
    input.addEventListener("focus", () => {
      const previousActive = document.querySelector(
        ".active-cell"
      );
      if (previousActive && previousActive !== input) {
        previousActive.classList.remove("active-cell");
      }
      input.classList.add("active-cell");
      if (input.classList.contains("confirmed-letter") || input.classList.contains("revealed-letter")) {
        revealButton.disabled = true;
      } else {
        revealButton.disabled = false;
      }
    });
    input.addEventListener("input", (e) => {
      const target = e.target;
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
    input.addEventListener("keydown", (e) => {
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
          if (prevCell && !(prevCell == null ? void 0 : prevCell.classList.contains("revealed-letter")) && !(prevCell == null ? void 0 : prevCell.classList.contains("confirmed-letter"))) {
            prevCell.value = "";
          }
        } else if (!input.classList.contains("revealed-letter") && !input.classList.contains("confirmed-letter")) {
          input.value = "";
        }
        focusPrevCell(i, false);
      }
    });
  }
  const getUserInputHash = () => {
    let userAnswer = "";
    for (let i = 0; i < answerLen; i++) {
      const cell = document.getElementById(`cell-${i}`);
      userAnswer += ((cell == null ? void 0 : cell.value) || "").toUpperCase();
    }
    return fnv32a(userAnswer);
  };
  const setLetter = (pos, c) => {
    const cell = document.getElementById(`cell-${pos}`);
    cell.value = c;
    cell.focus();
    cell.classList.add("revealed-letter");
  };
  const getActive = () => {
    const active = document.querySelector(
      ".active-cell"
    );
    if (!active)
      return -1;
    const allInputs = Array.from(document.querySelectorAll("input"));
    return allInputs.indexOf(active);
  };
  const revealLetter = (answerBase64, pos) => {
    const decoded = atob(answerBase64);
    if (!pos)
      pos = getActive();
    if (pos < 0 || pos >= decoded.length) {
      throw new Error("Position out of bounds");
    }
    const c = decoded.charAt(pos);
    setLetter(pos, c);
  };
  const checkLetter = (answerBase64, pos) => {
    const decoded = atob(answerBase64);
    if (pos === void 0)
      pos = getActive();
    if (pos < 0 || pos >= decoded.length) {
      throw new Error("Position out of bounds");
    }
    const c = decoded.charAt(pos);
    const cell = getCell(pos);
    if (cell.value === "" || cell.classList.contains("revealed-letter"))
      return;
    if (c === cell.value) {
      cell.classList.add("confirmed-letter");
    } else {
      cell.classList.add("wrong-letter");
    }
  };
  const checkWord = (answerBase64) => {
    for (let i = 0; i < answerLen; i++) {
      checkLetter(answerBase64, i);
    }
  };
  return {
    container,
    getUserInputHash,
    setLetter,
    getActive,
    revealLetter,
    checkLetter,
    checkWord
  };
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
document.getElementById("check-button").addEventListener("click", function(event) {
  event.stopPropagation();
  this.parentElement.classList.toggle("open");
});
document.addEventListener("click", function() {
  document.querySelectorAll(".check-dropdown.open").forEach(function(dropdown) {
    dropdown.classList.remove("open");
  });
});
export {
  compareHashes,
  fnv32a,
  generateInteractiveCrossword
};
