# Single Word "Crossword" Puzzle

This is a project to create a simple, framework-less solution to having a "daily clue" type puzzle easily embedded in a website.

The core functionality lies in `src/clue.ts`, the rest of the project largely serves as a demo.

I'm currently using this project at my site [pjvf.me](https://pjvf.me) and I detail that implementation below at [#hugo](#hugo)

## typescript code

### generateInteractiveCrossword

This function looks for an element with the id "crossword-container" and creates the html elements to generate the answer box which looks like the following:

<p align="center">
  <img src="images/Hell adds nothing to greeting.png" width="400"/>
  <br/>
  <br/>
</p>

```ts
export const generateInteractiveCrossword = (
  answerLen: number
): {
  container: HTMLDivElement;
  getUserInputHash: () => number;
  setLetter: (pos: number, c: string) => void;
  getActive: () => number;
  revealLetter: (answerBase64: string, pos: number | null) => void;
  checkLetter: (answerBase64: string, pos: number | undefined) => void;
  checkWord: (answerBase64: string) => void;
} => {
   ...
}
```

`answerLen` is, as you might imagine, the length of the answer, and is the number of cells that will be produced.

There's several returns, most of them functions:

- `container` is just the `<div>`, in case you need to play with it.
- `getUserInputHash` is a function that returns the `fnv32a` hash of what is in the `input` elements within the cells.
- `setLetter` sets a letter at position `pos` to character `c`
- `getActive` returns the currently active cell (whatever the users cursor is on)
- `revealLetter` takes in the base64 version of the answer. If a `pos` is given, it reveals that letter, otherwise it uses `getActive` and reveals the letter there. This sets the class `.revealed-letter` on that cell
- `checkLetter` is similar to the above, but adds either the class `.wrong-letter` or `.confirmed-letter`, depending on if the cell contains the correct letter.
- `checkWord` checks the whole word (literally just calls checkLetter repeatedly)

### compareHashes

The other main important function is `compareHashes`. It takes in two functions, each of which return a number, the assumption is that this number is the hash of the `answer` and `user input` respectively. It also looks for the html element with the id `result` to print the results.

```ts
export const compareHashes = (
  getAnswerHash: () => number,
  getUserInputHash: () => number
) => {
  const resultDiv = document.getElementById("result") as HTMLElement;
  const answerHash = getAnswerHash()
  const userInputHash = getUserInputHash()
  if (userInputHash === answerHash) 
   ...
}
```

I'm using hashing here because otherwise someone could theoretically – depending on the implementation – look at the html source code in the browser to see the answer in plain text. This is not a huge issue, except I don't want a curious person to glance at the code and immediately discover the answer by accident. (plus hashing's fun idk).

Note: with the addition of the check and reveal functions, hashes aren't as useful. I'm still using them, but also using base64 which is better for per-character operations. See below.

## build, demo, and styling

I said above, the rest of this project largely serves as a demo. It uses `deno` and basic html / css to generate the page.

Run `deno task start` to start the build script and run script

- `main.ts`  This file creates a simple server at `localhost:8080` and serves up the necessary files
- `build.ts` This file runs the build script, which watches for changes and builds a few things
  - `dist/clue.min.js` this is the minified output file to include in your project
  - `demo/clue.js` this is the unminified output file for the demo
  - `demo/devHelper.js` this is a file that contains a single function which returns the answer, fetched from a .env expecting the format `ANSWER="EXAMPLE"`. The purpose is to serve as an example for using the hashing.
- `src/style.scss` contains simple, commented styling you can use / adapt
- `index.html` has the html and example for how to use this project

## Hugo

I'm currently using this project at my site [pjvf.me](https://pjvf.me) which runs [hugo](https://gohugo.io/). Here's how I've implemented it:

`assets/` contains `clue.min.js` and `clue.css`

`layouts/partials/clue.html:`

```html
<div id="clue-a-day">
  <p>{{ .clue }}</p>
  <div id="crossword-container"></div>
  <div class="clue-button-container">
    <div class="clue-check-container">
      <button id="submit-button">Submit</button>
      <div id="result"></div>
    </div>
    <div class="check-dropdown">
      <button id="check-button" class="button">Check</button>
      <div class="check-dropdown-menu">
        <button id="check-letter-button" class="button">
          Check Letter
        </button>
        <button id="check-word-button" class="button">Check Word</button>
      </div>
    </div>
    <div class="clue-check-container">
      <button id="reveal-button">Reveal Letter</button>
    </div>
  </div>
</div>
<script type="module">
  import { generateInteractiveCrossword, compareHashes } from '/assets/clue.min.js';
  
  const crossword = generateInteractiveCrossword({{ .answerLen }});
  const getAnswerHash = () => {{.answerHash}}

  const submitButton = document.getElementById("submit-button");

  submitButton?.addEventListener("click", () =>
    compareHashes(getAnswerHash, crossword.getUserInputHash)
  );

  const revealButton = document.getElementById("reveal-button");

  revealButton?.addEventListener("click", () =>
    crossword.revealLetter({{.base64}})
  );

  const checkLetter = document.getElementById("check-letter-button")

  checkLetter.addEventListener("click", () =>{
    crossword.checkLetter({{.base64}})
  })
  
  const checkWord = document.getElementById("check-word-button")
  
  checkWord.addEventListener("click", () =>{
    crossword.checkWord({{.base64}})
  })
</script>
```

the various variables I'm accessing with `.<variable>` are passed in by the layout:

`layouts/partials/renderClue.html`

```js
{{ with resources.Get "sass/clue.scss" }}
  {{ $opts := dict
    "enableSourceMap" (not hugo.IsProduction)
    "outputStyle" (cond hugo.IsProduction "compressed" "expanded")
    "targetPath" "css/clue.css"
    "sourceMapIncludeSources" true
    "transpiler" "dartsass"
  }}
  {{ with . | toCSS $opts }}
    {{ if hugo.IsProduction }}
      {{ with . | fingerprint }}
        <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
        {{ end }}
        {{ else }}
      <link rel="stylesheet" href="{{ .RelPermalink }}">
    {{ end }}
  {{ end }}
{{ end }}

{{ if .Params.answer }}

  {{- $page := . -}}
  {{- $answerHash := hash.FNV32a $page.Params.answer -}}
  {{- $answerLen := len $page.Params.answer -}}
  {{- $clue := $page.Params.clue -}}
  {{- $base64 := encoding.Base64Encode .Params.answer -}}
  {{- partial "clue.html" (dict
    "answerLen" $answerLen
    "answerHash" $answerHash
    "clue" $clue
    "base64" $base64
  ) -}}

  {{ range $key, $value := $page.Params.hints }}
  <details>
    <summary>{{ $key }}</summary>
    <div class="hint-content">
      {{ $value | markdownify }}
    </div>
  </details>
  {{ end }}
{{ end }}
```

And the params are from an individual post:

`content/blog/dailyclue/2025-03-29.md`
```js
+++
title = '2025-03-29'
date = "2025-03-29T00:00:00-04:00"
draft = false
layout = "dailyclue"
type = "clue"
tags = ["clue-a-day", "cryptic"]
[params]
  comments = true
  answer = "EAGER"
  clue = "Keen to mature in emergency room (5)"
  [params.hints]
    "definition / wordplay separation" = "Keen = definition"
    "clue-type" = "container (something goes inside something else to make the answer)"
    "full parse / solution" = """Keen = definition; to mature = AGE, emergency room = ER.

AGE in ER = EAGER.

= Keen
    """
+++
```

## Future Work

- [x] Add a check function that tells you any correct letters
- [x] Add a reveal letter function
  - [ ] Particular letter chosen by solver
  - [ ] Configurable order of reveal (default would be left to right, but perhaps on some answer you'd want a different order)
- [ ] Add a hint function (ex.: separate the definition and wordplay - for cryptics)
- [ ] Add a wordle-like pasteable after completing
  - [ ] Add a browser-stored history of solves

### maybe??

- [ ] build off of this and make a self-hostable open source crossword importer app ?

