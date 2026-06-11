import { useEffect, useRef, useState } from 'react';
import {
    getProcessedAValuesAsync, getProcessedCValuesAsync, getProcessedGValuesAsync, getProcessedTValuesAsync,
    getPeaksQualitiesAsync, getPeaksNamesAsync, getPeaksExitTimesAsync,
} from '../../../api/mockSeqProcessedValues.js';
import { useLeftPanelResize } from './hooks/useLeftPanelResize.js';
import SeqGraphComponent from './SeqGraphComponent.jsx';

const TIME_STEP_MS = 250;

function detectSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Set before the first render so SeqGraphComponent's effect (which runs
// before App's effects) reads the correct theme's CSS variables.
document.documentElement.dataset.appliedMode = detectSystemTheme();

export default function App() {
    const [theme, setTheme] = useState(detectSystemTheme);
    const [processedValues, setProcessedValues] = useState(null);

    const leftResizerRef = useRef(null);
    useLeftPanelResize(leftResizerRef);

    function toggleTheme() {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        // Set synchronously, before setTheme triggers a re-render — child
        // effects run before this component's, so the attribute must
        // already be updated by the time SeqGraphComponent re-reads colors.
        document.documentElement.dataset.appliedMode = nextTheme;
        setTheme(nextTheme);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [valuesA, valuesC, valuesG, valuesT] = await Promise.all([
                getProcessedAValuesAsync(), getProcessedCValuesAsync(), getProcessedGValuesAsync(), getProcessedTValuesAsync(),
            ]);
            const [peaksExitTimes, peaksNames, peaksQualities] = await Promise.all([
                getPeaksExitTimesAsync(), getPeaksNamesAsync(), getPeaksQualitiesAsync(),
            ]);

            if (cancelled) return;
            setProcessedValues({
                valuesA, valuesC, valuesG, valuesT,
                peaksExitTimes, peaksNames, peaksQualities,
                timeStepMs: TIME_STEP_MS,
            });
        })();

        return () => { cancelled = true; };
    }, []);

    return (
        <>
            <div className="left" id="left-id"></div>
            <div ref={leftResizerRef} className="left-resizer" id="left-resizer-id"></div>

            <div className="zoom-controls">
                <button id="seqzoom-out-id">−</button>
                <button id="seqzoom-in-id">+</button>
            </div>

            <div className="theme-controls">
                <button onClick={toggleTheme}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            {processedValues && <SeqGraphComponent processedValues={processedValues} theme={theme} />}
        </>
    );
}
