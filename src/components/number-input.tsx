import React, { useRef, useState, useEffect } from "react";

interface NumberInputProps {
    min:number,
    max:number,
    step?:number,
    defaultValue?:number,
    value?:number,
    onChange?:(n:number)=>void
}

const NumberInput = ({min, max, step=1, defaultValue=min, value, onChange} : NumberInputProps) => {

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const initY = useRef(0)
    const [internalValue, setInternalValue] = useState<number>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!isControlled) setInternalValue(Number(e.target.value))
        if(onChange) onChange(Number(e.target.value));
    }

    // Global event handlers for consistent cross-browser behavior
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            e.preventDefault()
            const deltaY = initY.current - e.clientY;
            let result = Math.round((currentValue + deltaY));
            if(result > max) result = max ;
            if(result < min) result = min ;

            if(!isControlled) setInternalValue(result)
            if(onChange) onChange(result);

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
    }, [isDragging, value, max, min, internalValue]);

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        initY.current = e.clientY;
    };


    const getMinWidth = (n:number) => {
        let minWidth = 4;
        minWidth += n.toString().length
        return minWidth;
    }

    return(
        <div
            onMouseDown={onMouseDown}
            className="w-fit h-fit cursor-ns-resize">
                <style jsx>{`
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        opacity: 1;
                        display: block;
                    }
                `}</style>
                <input
                    style={{
                        width:`${getMinWidth(currentValue)}ch`
                    }}
                    className="cursor-ns-resize border border-gray-400 pl-2 pr-1 rounded-sm"
                    value={currentValue}
                    type="number"
                    max={max}
                    min={min}
                    step={step}
                    onChange={handleChange}
                />
        </div>
    )
}

export default NumberInput;