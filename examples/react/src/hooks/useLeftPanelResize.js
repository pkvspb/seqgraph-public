import { useEffect } from 'react';

export function useLeftPanelResize(resizerRef, { minPercent = 10, maxPercent = 70 } = {}) {
    useEffect(() => {
        const resizer = resizerRef.current;
        if (!resizer) return;

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

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            resizer.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [resizerRef, minPercent, maxPercent]);
}
