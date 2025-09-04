import React, { useRef, useState, useEffect } from "react";

interface SliderInputProps {
    min:number,
    max:number,
    step:number,
    defaultValue:number,
    threshold:number
}

const NumberInputSlider = ({min, max, step=1, defaultValue=0, threshold=1} :SliderInputProps) => {

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const initY = useRef(0)
    const [value, setValue] = useState<number>(defaultValue);

    // Global event handlers for consistent cross-browser behavior
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            e.preventDefault()
            const deltaY = initY.current - e.clientY ;
            let result = Math.round((value + deltaY));
            if(result > max) result = max ;
            if(result < min) result = min ;
            setValue(result);
            initY.current = initY.current - deltaY;
            document.body.style.cursor = 'ns-resize'
        };
        
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            initY.current = 0;
            document.body.style.cursor = 'auto'
        };

        // Attach to document for global capture
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, value, max, min]);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        initY.current = e.clientY;
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(Number(e.target.value));
    }

    return(
        <div
            onMouseDown={onMouseDown}
            className="w-fit h-fit cursor-ns-resize">
                <input
                    className="cursor-ns-resize border border-gray-400  w-fit text-center"
                    value={value}
                    type="number"
                    max={max}
                    min={min}
                    step={step}
                    onChange={onChange}
                />
        </div>
    )
}

export default NumberInputSlider;