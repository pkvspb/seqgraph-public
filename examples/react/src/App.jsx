import { useEffect, useRef, useState } from 'react';
import {
    getProcessedAValuesAsync, getProcessedCValuesAsync, getProcessedGValuesAsync, getProcessedTValuesAsync,
    getPeaksQualitiesAsync, getPeaksNamesAsync, getPeaksExitTimesAsync,
} from '../../../api/mockSeqProcessedValues.js';
import { useLeftPanelResize } from './hooks/useLeftPanelResize.js';
import SeqGraphComponent from './SeqGraphComponent.jsx';

const TIME_STEP_MS = 250;

export default function App() {
    const [theme, setTheme] = useState(() =>
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    const [processedValues, setProcessedValues] = useState(null);

    const leftResizerRef = useRef(null);
    useLeftPanelResize(leftResizerRef);

    useEffect(() => {
        document.documentElement.dataset.appliedMode = theme;
    }, [theme]);

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
                <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            {processedValues && <SeqGraphComponent processedValues={processedValues} theme={theme} />}
        </>
    );
}
