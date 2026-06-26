import { useRef, useEffect } from 'react';
import { initSeqComponent } from '../../../lib/seqcomponent.js';

export default function SeqGraphComponent({ processedValues, theme }) {
    const seqGraphContainerRef = useRef(null);

    function getStyledColor(typeName) {
        return getComputedStyle(seqGraphContainerRef.current).getPropertyValue(typeName);
    }

    function drawSeqComponent(processedValues) {
        const colorA = getStyledColor('--seq-graph-a');
        const colorC = getStyledColor('--seq-graph-c');
        const colorG = getStyledColor('--seq-graph-g');
        const colorT = getStyledColor('--seq-graph-t');

        const seqGraphId = 'seqgraph-id';
        const seqGraphContainerId = 'seqgraph-container-id';

        const seqScrollId = 'seqscroll-id';
        const seqScrollContainerId = 'seqscroll-container-id';
        const seqScrollBackground = getStyledColor('--scroll-back');
        const seqScrollPortColor = getStyledColor('--scroll-port');

        const seqZoomOutId = 'seqzoom-out-id';
        const seqZoomInId = 'seqzoom-in-id';

        const seqXNumAxisId = 'seq-x-num-axis-id';
        const seqXNumAxisContainerId = 'seq-x-num-axis-container-id';
        const seqXNumAxisFontSize = 9;
        const seqQualitiesId = 'seq-qualities-id';
        const seqQualitiesContainerId = 'seq-qualities-container-id';
        const seqQualitiesFontSize = 8;
        const seqXNucAxisId = 'seq-x-nuc-axis-id';
        const seqXNucAxisContainerId = 'seq-x-nuc-axis-container-id';
        const seqXNucAxisFontSize = 11;
        const seqXAxisFontColor = getStyledColor('--text');
        const seqXAxisMutationFontColor = getStyledColor('--seq-mutation');
        const seqXAxisFontName = '"Fira Code", monospace';

        const seqYAxis05Id = 'seq-y-axis-05-id';
        const seqYAxis10Id = 'seq-y-axis-10-id';
        const seqYAxisFontSize = 11;
        const seqYAxisFontColor = getStyledColor('--text');
        const seqYAxisFontName = '"Fira Code", monospace';

        const graph = { seqGraphId, seqGraphContainerId };
        const scroll = { seqScrollId, seqScrollContainerId, seqScrollBackground, seqScrollPortColor };
        const zoom = { seqZoomOutId, seqZoomInId };
        const values = processedValues;
        const colors = { colorA, colorC, colorG, colorT };

        const xAxis = {
            seqXNumAxisId, seqXNumAxisContainerId, seqXNumAxisFontSize,
            seqQualitiesId, seqQualitiesContainerId, seqQualitiesFontSize,
            seqXNucAxisId, seqXNucAxisContainerId, seqXNucAxisFontSize,
            seqXAxisFontColor, seqXAxisMutationFontColor, seqXAxisFontName,
        };

        const yAxis = {
            seqYAxis05Id, seqYAxis10Id, seqYAxisFontSize, seqYAxisFontColor, seqYAxisFontName,
        };

        return initSeqComponent(graph, scroll, zoom, values, colors, xAxis, yAxis);
    }

    useEffect(() => {
        const unInitSeqComponent = drawSeqComponent(processedValues);

        return () => unInitSeqComponent();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- drawSeqComponent closes over the stable ref/getStyledColor
    }, [processedValues, theme]);

    return (
        <>
            <div className="x-num-axis-container" id="seq-x-num-axis-container-id">
                <canvas id="seq-x-num-axis-id"></canvas>
            </div>

            <div className="qualities-container" id="seq-qualities-container-id">
                <canvas id="seq-qualities-id"></canvas>
            </div>

            <div className="x-nuc-axis-container" id="seq-x-nuc-axis-container-id">
                <canvas id="seq-x-nuc-axis-id"></canvas>
            </div>

            <div className="y-axis-container">
                <span id="seq-y-axis-10-id"></span>
                <span id="seq-y-axis-05-id"></span>
            </div>

            <div ref={seqGraphContainerRef} className="graph-container" id="seqgraph-container-id">
                <canvas id="seqgraph-id"></canvas>
            </div>

            <div className="scroll-container" id="seqscroll-container-id">
                <canvas id="seqscroll-id"></canvas>
            </div>
        </>
    );
}
