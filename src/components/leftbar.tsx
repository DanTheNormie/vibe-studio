import { ListTree, PlusCircle, PlusIcon } from "lucide-react"
import LeftbarItem from "./leftbar_item"
import { JSX } from "react"



type item = {
    icon: JSX.Element,
    name: string,
}

interface LeftbarProps {
    items:item[]
}

const Leftbar = ({items}:LeftbarProps) => {

    return(
        <div className="flex flex-col w-fit h-full justify-center items-center border-r border-gray-200">
            {items.map((item)=>{
                return (<LeftbarItem icon={item.icon} name={item.name} onClick={()=>{}}/>)
            })}
        </div>
    )
}

export default Leftbar;