import { useState, useEffect } from 'react';

/**
 * useBreakpoint — returns current breakpoint info as booleans.
 * Reactive to window resize. Use to conditionally apply inline styles
 * alongside CSS classes for full responsive coverage.
 */
function useBreakpoint() {
    const [width, setWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    return {
        width,
        isMobile: width <= 768,
        isTablet: width <= 1024,
        isSmall: width <= 480,
    };
}

export default useBreakpoint;