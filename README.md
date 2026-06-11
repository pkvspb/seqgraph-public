# SeqComponent — DNA Sequence Trace Viewer

Example of using the SeqComponent canvas library to visualize processed DNA
sequencing trace data from a Sanger-style sequencing instrument.

- **4 channels** (A/C/G/T), each rendered as a colored trace on an HTML5 Canvas
- **Per-base quality row** — color-coded bars (low/medium/high) below the trace
- **Nucleotide axis** — base calls (A/C/G/T) shown above the quality row, with a
  numeric peak-index axis above that
- **Zoom in/out** — ×2 per click, window centered on the visible range
- **Horizontal scroll bar** — drag to pan after zooming in
- **Y-axis** auto-scaled to the dataset's overall maximum, with half/full labels
- **Light and dark theme** support via CSS custom properties

## Demos

Two equivalent demos are included — a build-free vanilla JS/HTML/CSS version
and a Vite + React version.

### Vanilla demo (no build step)

ES modules require a local server (browsers block `file://` imports).

```bash
npx http-server -p 8080 -c-1
```

Then open `http://localhost:8080/examples/vanilla/` in a browser.

VS Code: start the server, then **F5** → **Vanilla demo**.

### React demo

```bash
cd examples/react
npm install
npm run dev
```

Then open the URL Vite prints (defaults to `http://localhost:5173/`), or with
the dev server running, VS Code: **F5** → **React demo**. See
[React wrapper pattern](#react-wrapper-pattern) below for how the library is
integrated as a component.

## Files

| File | Purpose |
|------|---------|
| `examples/vanilla/index.html` | Page structure — all required element IDs |
| `examples/vanilla/example.css` | Layout and theming — adjust the `--*` constants at the top to resize the component |
| `examples/vanilla/example.js` | Theme detection and `initSeqComponent` call |
| `examples/react/` | React demo — see [React demo](#react-demo) below |
| `api/mockSeqProcessedValues.js` | Mock processed trace data: A/C/G/T intensities, peak calls, exit times, qualities, 250 ms/sample |
| `lib/seqcomponent.js` | Library entry point — **import this file** |
| `lib/seqgraph.js` | Canvas renderer (also exported for standalone use) |
| `lib/seqscroll.js` | Scroll bar (also exported for standalone use) |

## DOM contract

`initSeqComponent` locates elements by ID at call time. The following elements
must exist in the page before the script runs:

| ID | Tag | Purpose |
|----|-----|---------|
| `seqgraph-id` | `<canvas>` | Main graph — library paints the A/C/G/T traces here |
| `seqgraph-container-id` | `<div>` | Controls graph canvas size via `getBoundingClientRect()` |
| `seqscroll-id` | `<canvas>` | Horizontal scroll bar |
| `seqscroll-container-id` | `<div>` | Controls scroll canvas size |
| `seqzoom-out-id` | `<button>` | Zoom out (halves the zoom level) |
| `seqzoom-in-id` | `<button>` | Zoom in (doubles the zoom level) |
| `seq-x-num-axis-id` | `<canvas>` | Numeric peak-index axis |
| `seq-x-num-axis-container-id` | `<div>` | Controls numeric axis canvas width |
| `seq-qualities-id` | `<canvas>` | Per-base quality color bars |
| `seq-qualities-container-id` | `<div>` | Controls quality row canvas width |
| `seq-x-nuc-axis-id` | `<canvas>` | Nucleotide (A/C/G/T) axis |
| `seq-x-nuc-axis-container-id` | `<div>` | Controls nucleotide axis canvas width |
| `seq-y-axis-05-id` | `<span>` | Y-axis half-maximum label (positioned by the library) |
| `seq-y-axis-10-id` | `<span>` | Y-axis maximum label (positioned by the library) |

**Size the `<div>` containers with CSS, not the `<canvas>` elements directly.**
The library reads container dimensions and resizes the canvases automatically,
including on window resize.

## Providing your own data

```js
const values = {
    valuesA: [/* Array<number> — channel A intensity per sample */],
    valuesC: [/* Array<number> — channel C intensity per sample */],
    valuesG: [/* Array<number> — channel G intensity per sample */],
    valuesT: [/* Array<number> — channel T intensity per sample */],

    peaksExitTimes: [/* Array<number> — ms offset of each called peak */],
    peaksNames:     [/* Array<string> — base call per peak, e.g. "A"/"C"/"G"/"T" */],
    peaksQualities: [/* Array<number> — quality score per peak (0–60ish) */],

    timeStepMs: 250, // milliseconds between consecutive trace samples
};
```

The four channel arrays drive the main graph and the Y-axis auto-scale
(maximum across all four channels). The `peaks*` arrays (one entry per called
base) drive the numeric axis, nucleotide axis and quality row — `peaksNames[i]`
not in `{A, C, G, T}` is shown in `seqXAxisMutationFontColor` instead of its
channel color. Quality thresholds: `< 10` low, `< 30` medium, otherwise high.

## `initSeqComponent` reference

```js
const cleanup = initSeqComponent(graph, scroll, zoom, values, colors, xAxis, yAxis);
```

| Parameter | Shape | Description |
|-----------|-------|-------------|
| `graph` | `{ seqGraphId, seqGraphContainerId }` | Canvas and container IDs for the main graph |
| `scroll` | `{ seqScrollId, seqScrollContainerId, seqScrollBackground, seqScrollPortColor }` | Scroll bar IDs and colors |
| `zoom` | `{ seqZoomOutId, seqZoomInId }` | Zoom button IDs |
| `values` | `{ valuesA, valuesC, valuesG, valuesT, peaksExitTimes, peaksNames, peaksQualities, timeStepMs }` | Trace data, peak calls and sampling interval |
| `colors` | `{ colorA, colorC, colorG, colorT }` | One CSS color per channel |
| `xAxis` | `{ seqXNumAxisId, seqXNumAxisContainerId, seqXNumAxisFontSize, seqQualitiesId, seqQualitiesContainerId, seqQualitiesFontSize, seqXNucAxisId, seqXNucAxisContainerId, seqXNucAxisFontSize, seqXAxisFontColor, seqXAxisMutationFontColor, seqXAxisFontName }` | Numeric axis, quality row and nucleotide axis canvases and font settings |
| `yAxis` | `{ seqYAxis05Id, seqYAxis10Id, seqYAxisFontSize, seqYAxisFontColor, seqYAxisFontName }` | Y-axis label elements and font settings |

`cleanup()` removes all event listeners attached by the library (resize,
click, pointer, crosshair). Call it when tearing down the component.

## React wrapper pattern

`examples/react/` is a small Vite + React app showing how to wrap the library
as a component instead of calling `initSeqComponent` directly from a script.

Key file: `examples/react/src/SeqGraphComponent.jsx`. The pattern:

- A `useRef` on the graph's container `<div>`, and a `useEffect` keyed on
  `[processedValues, theme]` that calls `initSeqComponent(...)` and returns
  its cleanup function — React calls the cleanup automatically before the
  next effect run and on unmount.
- All chart colors (`colorA/C/G/T`, axis font colors, mutation color, scroll
  bar colors) are read from CSS custom properties via `getComputedStyle`
  rather than hardcoded in JS — see the `--seq-graph-*`, `--seq-mutation`,
  `--text`, `--scroll-back` and `--scroll-port` variables in
  `examples/react/src/App.css`. Toggling `data-applied-mode` on `<html>` and
  re-running the effect (via the `theme` dependency) is enough to re-theme
  the chart.
- The component renders the same fixed-ID containers/canvases as
  `examples/vanilla/index.html`'s component portion; the surrounding "demo
  chrome" (resizable left panel, zoom buttons, theme toggle) lives in
  `examples/react/src/App.jsx`.

This is the recommended approach when integrating SeqComponent into a
component-based app.

## Updating the library files

The files in `lib/` and `api/` are generated by the SeqComponent source
project (`SequenceHub/webcomponents`). To update them, run from that
project's root:

```bash
npm run deploy
```

This rebuilds the library and copies the output here automatically.

## License

This repository uses two licenses:

- **`lib/`** — the compiled, obfuscated `seqcomponent.js`/`seqgraph.js`/
  `seqscroll.js` are proprietary and provided under the terms in
  [`lib/LICENSE`](lib/LICENSE): you may use them unmodified as a dependency in
  your own projects, but may not redistribute, modify, decompile, or resell
  them.
- **Everything else** (examples, mock data, documentation) is licensed under
  the Apache License, Version 2.0 — see [`LICENSE`](LICENSE).
