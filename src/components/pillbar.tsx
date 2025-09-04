
interface Position {
    x:number,
    y:number
}

interface PillbarProps {
    resolution: Position,
    scale: number
}

const Pillbar = ({resolution, scale}:PillbarProps)=>{
    return(
        <div className="flex gap-4 border border-gray-400 bg-amber-100 w-fit px-6 py-2 rounded-full ">
            <div className="flex gap-3">
                <div className="px-2 border border-gray-400">{resolution.x}</div>
                <p>x</p>
                <div className="px-2 border border-gray-400">{resolution.y}</div>
            </div>
            <div>|</div>
            <div className="flex gap-1">
                <div className="px-2 border border-gray-400">{scale}</div>
                <div>%</div>
            </div>
        </div>
    )
}

export default Pillbar