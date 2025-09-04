import { Tooltip, TooltipContent, TooltipTrigger } from "@components/tooltip";
import { JSX } from "react"

interface LeftbarItemProps {
    icon: JSX.Element;
    name: string;
    onClick: () => void;
}

const LeftbarItem = ({ icon, name, onClick }: LeftbarItemProps) => {
    return (
        <div className=" w-full flex justify-center items-center p-4" onClick={onClick}>
            <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                    {icon}
                </TooltipTrigger>
                <TooltipContent side={'right'} >
                    {name}
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export default LeftbarItem;