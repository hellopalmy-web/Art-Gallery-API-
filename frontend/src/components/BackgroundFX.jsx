import { useEffect, useRef } from "react";

export default function BackgroundFX() {
    const rootRef = useRef(null);
    const pointerRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

    useEffect(() => {
        const root = rootRef.current;
        const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        if (!root || !supportsHover.matches || prefersReducedMotion.matches) return undefined;

        const pointer = pointerRef.current;
        pointer.targetX = window.innerWidth / 2;
        pointer.targetY = window.innerHeight / 2;
        pointer.currentX = pointer.targetX;
        pointer.currentY = pointer.targetY;
        let frameId = 0;
        let pageVisible = document.visibilityState === "visible";

        const animate = () => {
            frameId = 0;
            if (!pageVisible) return;

            pointer.currentX += (pointer.targetX - pointer.currentX) * 0.1;
            pointer.currentY += (pointer.targetY - pointer.currentY) * 0.1;
            root.style.setProperty("--mx", `${pointer.currentX}px`);
            root.style.setProperty("--my", `${pointer.currentY}px`);

            const offsetX = (pointer.currentX / window.innerWidth - 0.5) * 2;
            const offsetY = (pointer.currentY / window.innerHeight - 0.5) * 2;
            document.querySelectorAll(".hero-art").forEach((element) => {
                element.style.setProperty("--parallax-x", `${offsetX * 18}px`);
                element.style.setProperty("--parallax-y", `${offsetY * 18}px`);
            });
            document.querySelectorAll(".hero").forEach((element) => {
                element.style.setProperty("--circle-x", `${offsetX * 12}px`);
                element.style.setProperty("--circle-y", `${offsetY * 12}px`);
                element.style.setProperty("--depth-x", `${offsetX * 6}px`);
                element.style.setProperty("--depth-y", `${offsetY * 6}px`);
            });

            if (Math.abs(pointer.targetX - pointer.currentX) > 0.1 || Math.abs(pointer.targetY - pointer.currentY) > 0.1) {
                frameId = window.requestAnimationFrame(animate);
            }
        };

        const onPointerMove = (event) => {
            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
            if (pageVisible && !frameId) frameId = window.requestAnimationFrame(animate);
        };

        const onVisibilityChange = () => {
            pageVisible = document.visibilityState === "visible";
            if (!pageVisible && frameId) {
                window.cancelAnimationFrame(frameId);
                frameId = 0;
            } else if (pageVisible && !frameId
                && (Math.abs(pointer.targetX - pointer.currentX) > 0.1 || Math.abs(pointer.targetY - pointer.currentY) > 0.1)) {
                frameId = window.requestAnimationFrame(animate);
            }
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            if (frameId) window.cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="bg-fx" aria-hidden="true" ref={rootRef}>
            <div className="bg-fx-orb bg-fx-orb-gold" />
            <div className="bg-fx-orb bg-fx-orb-green" />
            <div className="bg-fx-orb bg-fx-orb-wine" />
            <div className="bg-fx-spotlight" />
        </div>
    );
}
