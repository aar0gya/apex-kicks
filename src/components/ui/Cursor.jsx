import { useRef, useEffect } from 'react';

/**
 * Cursor — custom magnetic cursor with a lagged ring.
 * The red dot snaps to the mouse; the ring follows with lerp smoothing.
 * Both grow when hovering over interactive elements.
 */
function Cursor() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        let mx = 0, my = 0;   // mouse position
        let rx = 0, ry = 0;   // ring lerp position
        let animId;

        // ── Snap dot to exact mouse position ──────────────────────
        const onMouseMove = (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (dotRef.current) {
                dotRef.current.style.left = `${mx}px`;
                dotRef.current.style.top = `${my}px`;
            }
        };

        // ── Lerp ring toward mouse ────────────────────────────────
        const loop = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            if (ringRef.current) {
                ringRef.current.style.left = `${rx}px`;
                ringRef.current.style.top = `${ry}px`;
            }
            animId = requestAnimationFrame(loop);
        };

        // ── Grow on interactive elements ──────────────────────────
        const grow = () => {
            dotRef.current?.classList.add('cursor-grow');
            ringRef.current?.classList.add('ring-grow');
        };
        const shrink = () => {
            dotRef.current?.classList.remove('cursor-grow');
            ringRef.current?.classList.remove('ring-grow');
        };

        document.addEventListener('mousemove', onMouseMove);

        // Attach grow/shrink to all buttons, links and cards
        const interactiveEls = document.querySelectorAll('button, a, .product-card');
        interactiveEls.forEach((el) => {
            el.addEventListener('mouseenter', grow);
            el.addEventListener('mouseleave', shrink);
        });

        animId = requestAnimationFrame(loop);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animId);
            interactiveEls.forEach((el) => {
                el.removeEventListener('mouseenter', grow);
                el.removeEventListener('mouseleave', shrink);
            });
        };
    }, []);

    return (
        <>
            <div className="cursor" ref={dotRef} />
            <div className="cursor-ring" ref={ringRef} />
        </>
    );
}

export default Cursor;