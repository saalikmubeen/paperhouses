import { useLayoutEffect } from "react";

export const useScrollToTop = () => {
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);
};
