import React, { useRef, useState } from "react";

interface SliderInputProps {
    min:number,
    max:number,
    step:number,
    defaultValue:number,
    threshold:number
}

const SliderInput = ({min, max, step=1, defaultValue=0, threshold=1} :SliderInputProps) => {

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const initY = useRef(0)
    const [value, setValue] = useState<number>(defaultValue);

    const onPointerDown = (e:React.PointerEvent) => {
        setIsDragging(true)
        initY.current = e.clientY
    }
    const onPointerUp = (e:React.PointerEvent) => {
        setIsDragging(false)
        initY.current = 0
    }
    const onPointerMove = (e:React.PointerEvent) => {
        if(isDragging){
            const deltaY = e.clientY - initY.current
            const result = Math.round((value + deltaY))
            if(result > max || result < min) return;
            setValue(result)
            initY.current = initY.current + deltaY;
        }    
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(Number(e.target.value));
    }

    return(
        <div
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            className="w-10 h-10 cursor-ns-resize">
                <input
                    className="cursor-ns-resize border border-gray-400 pl-2"
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

export default SliderInput;