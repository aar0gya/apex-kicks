import { useRef, useState, useEffect } from 'react';

/**
 * useInView — fires once when element scrolls into the viewport.
 * @param {number} threshold  0–1, fraction of element visible before triggering
 * @returns {[React.RefObject, boolean]}
 */
function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    // Once triggered, stop observing
                    observer.disconnect();
                }
            },
            { threshold }
        );

        const el = ref.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView];
}

export default useInView;