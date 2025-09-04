import { useCallback, useEffect, useRef, useState } from "react"

interface Position {
    x: number;
    y: number;
}

const Canvas = () => {
    const [elementPosition, setElementPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const lastMousePos = useRef<Position>({ x: 0, y: 0 });
    const [targetResolution, setTargetResolution] = useState<Position>({ x: 1366, y: 768 });
    const [userZoom, setUserZoom] = useState<number>(1);
    const [offset, setOffset] = useState<Position>({x:0, y:0});
    const [finalScale, setFinalScale] = useState<number>(1);

    useEffect(() => {
        if (!containerRef.current) return;

        const viewportWidth = containerRef.current.clientWidth;
        const viewportHeight = containerRef.current.clientHeight;

        console.log(`${viewportWidth} x ${viewportHeight}`)

        const scaleToFitWidth = viewportWidth / targetResolution.x;
        const scaleToFitHeight = viewportHeight / targetResolution.y;
        const baseScale = Math.min(scaleToFitWidth, scaleToFitHeight);

        const finalScale = baseScale * userZoom;

        const scaledCanvasWidth = targetResolution.x * finalScale;
        const scaledCanvasHeight = targetResolution.y * finalScale;

        const offsetX = (viewportWidth - scaledCanvasWidth) / 2;
        const offsetY = (viewportHeight - scaledCanvasHeight) / 2;
        setOffset({x:offsetX, y:offsetY})
        setFinalScale(finalScale)
    },[])


    // Center element on mount
    useEffect(() => {
        if (!containerRef.current || !elementRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();

        setElementPosition({
            x: (containerRect.width - elementRect.width) / 2,
            y: (containerRect.height - elementRect.height) / 2,
        });
    }, []);

    // Global mouse up handler to handle mouse leaving the container
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;

        setElementPosition(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
        }));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-dvh select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}

        >
            <div
                ref={elementRef}
                className="absolute w-24 h-24 bg-red-400 cursor-move"
                style={{
                    top: `${elementPosition.y}px`,
                    left: `${elementPosition.x}px`,
                    transform: `translate(${offset.x}px ${offset.y}px scale(${finalScale}))`,
                    transformOrigin: '0 0'
                }}
            />

            <div className="absolute top-4 right-4 bg-black/20 p-2 rounded text-sm font-mono">
                <p>X: {Math.round(elementPosition.x)}</p>
                <p>Y: {Math.round(elementPosition.y)}</p>
                <p>Dragging: {isDragging ? 'Yes' : 'No'}</p>
                <p>OffsetX: {Math.round(offset.x)}</p>
                <p>OffsetY: {Math.round(offset.y)}</p>
                <p>FinalScale: {Math.round(finalScale)}</p>

            </div>
        </div>
    );
};

export default Canvas;