import { initSeqComponent } from '../../lib/seqcomponent.js';
import {
    getProcessedAValuesAsync, getProcessedCValuesAsync, getProcessedGValuesAsync, getProcessedTValuesAsync,
    getPeaksQualitiesAsync, getPeaksNamesAsync, getPeaksExitTimesAsync,
} from '../../api/mockSeqProcessedValues.js';

// ── 1. Data ──────────────────────────────────────────────────────────────────
// Mock processed sequencing data: per-base A/C/G/T trace intensities, plus
// per-peak nucleotide calls, exit times and quality scores. 250 ms per sample.

const [valuesA, valuesC, valuesG, valuesT] = await Promise.all([
    getProcessedAValuesAsync(), getProcessedCValuesAsync(), getProcessedGValuesAsync(), getProcessedTValuesAsync(),
]);

const [peaksExitTimes, peaksNames, peaksQualities] = await Promise.all([
    getPeaksExitTimesAsync(), getPeaksNamesAsync(), getPeaksQualitiesAsync(),
]);

const timeStepMs = 250;

// ── 2. Theme ──────────────────────────────────────────────────────────────────
let dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

const graph = {
    seqGraphId:          'seqgraph-id',
    seqGraphContainerId: 'seqgraph-container-id',
};

const zoom = {
    seqZoomOutId: 'seqzoom-out-id',
    seqZoomInId:  'seqzoom-in-id',
};

const values = { valuesA, valuesC, valuesG, valuesT, peaksExitTimes, peaksNames, peaksQualities, timeStepMs };

// initSeqComponent returns a cleanup function that removes all event listeners.
// Re-running it with new colors/fonts is the simplest way to apply a theme change.
let cleanup = null;

function start(isDark) {
    document.documentElement.dataset.appliedMode = isDark ? 'dark' : 'light';

    const colors = {
        colorA: isDark ? 'ForestGreen'    : 'green',
        colorC: isDark ? 'CornflowerBlue' : 'blue',
        colorG: isDark ? 'DarkGray'       : 'black',
        colorT: 'red',
    };

    const scroll = {
        seqScrollId:          'seqscroll-id',
        seqScrollContainerId: 'seqscroll-container-id',
        seqScrollBackground: getComputedStyle(document.documentElement).getPropertyValue('--scroll-back'),
        seqScrollPortColor:  getComputedStyle(document.documentElement).getPropertyValue('--scroll-port'),
    };

    const xAxis = {
        seqXNumAxisId:          'seq-x-num-axis-id',
        seqXNumAxisContainerId: 'seq-x-num-axis-container-id',
        seqXNumAxisFontSize:    9,

        seqQualitiesId:          'seq-qualities-id',
        seqQualitiesContainerId: 'seq-qualities-container-id',
        seqQualitiesFontSize:    8,

        seqXNucAxisId:          'seq-x-nuc-axis-id',
        seqXNucAxisContainerId: 'seq-x-nuc-axis-container-id',
        seqXNucAxisFontSize:    11,

        seqXAxisFontColor:         isDark ? 'white' : 'black',
        seqXAxisMutationFontColor: isDark ? 'Peru'  : 'SaddleBrown',
        seqXAxisFontName:          'Verdana',
    };

    const yAxis = {
        seqYAxis05Id:      'seq-y-axis-05-id',
        seqYAxis10Id:      'seq-y-axis-10-id',
        seqYAxisFontSize:  11,
        seqYAxisFontColor: isDark ? 'white' : 'black',
        seqYAxisFontName:  'Verdana',
    };

    cleanup = initSeqComponent(graph, scroll, zoom, values, colors, xAxis, yAxis);
}

// ── 3. Wire up the component ──────────────────────────────────────────────────
start(dark);

// ── 4. Theme toggle button ────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle-id');
themeToggle.textContent = dark ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
    dark = !dark;
    themeToggle.textContent = dark ? '☀️' : '🌙';
    cleanup();
    start(dark);
});

// ── 5. Resizable left panel ───────────────────────────────────────────────────
// Demonstrates that the graph adapts to its container's size: the library's
// internal ResizeObserver picks up the new --left-width automatically.
initLeftPanelResize('left-resizer-id');

function initLeftPanelResize(resizerId, minPercent = 10, maxPercent = 70) {
    const resizer = document.getElementById(resizerId);
    let dragging = false;
    let rafId = null;

    resizer.addEventListener('mousedown', handleMouseDown);

    function handleMouseDown(e) {
        e.preventDefault();
        dragging = true;
        resizer.classList.add('active');
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!dragging) return;

        const percent = (e.clientX / window.innerWidth) * 100;
        const clampedPercent = Math.min(Math.max(percent, minPercent), maxPercent);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            document.documentElement.style.setProperty('--left-width', clampedPercent + '%');
        });
    }

    function handleMouseUp() {
        dragging = false;
        resizer.classList.remove('active');
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
}
