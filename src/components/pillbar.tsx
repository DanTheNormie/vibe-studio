import NumberInput from "./number-input"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"


interface Position {
    x:number,
    y:number
}

interface PillbarProps {
    resolution: Position,
    scale: number
    setScale: ()=>void
    setResolution: ()=>void,
}

const Pillbar = ({resolution, scale}:PillbarProps)=>{
    return(
        <div className="flex items-center gap-4  border-gray-400 w-fit px-6 py-2 rounded-full ">
            <div className="flex items-center gap-3">
                <Tooltip>
                    <TooltipTrigger>
                        <NumberInput min={1} max={2000}/>
                    </TooltipTrigger>
                    <TooltipContent>
                        width
                    </TooltipContent>
                </Tooltip>
                X
                <Tooltip>
                    <TooltipTrigger>
                        <NumberInput min={1} max={2000}/>
                    </TooltipTrigger>
                    <TooltipContent>
                        height
                    </TooltipContent>
                </Tooltip>

            </div>
            <div className="border h-[32px] border-gray-500"></div>
            <div className="flex items-center gap-1">
            <Tooltip>
                    <TooltipTrigger>
                        <NumberInput min={1} max={100}/>
                    </TooltipTrigger>
                    <TooltipContent>
                        size
                    </TooltipContent>
                </Tooltip>
                <div>%</div>
            </div>
        </div>
    )
}

export default Pillbar