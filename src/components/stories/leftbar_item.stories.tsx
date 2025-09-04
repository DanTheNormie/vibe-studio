import { Meta } from "@storybook/nextjs-vite"
import LeftbarItem from "@components/leftbar_item"
import { ListTree, PlusIcon } from "lucide-react"
import { StoryObj } from "@storybook/nextjs-vite"

const meta:Meta<typeof LeftbarItem> = {
    component:LeftbarItem,
    title:'Leftbar Item',
    tags:['autodocs'],
    argTypes:{
        icon:{
            table:{
                disable:true
            }
        },
        onClick:{
            table:{
                disable:true
            }
        }
    }
}

export default meta

type Story = StoryObj<typeof meta>

export const ComponentsItem:Story = {
    args:{
        icon:<PlusIcon/>,
        name: 'components',
        onClick:()=>{}
    },
}

export const NavigatorItem:Story = {
    args: {
        icon: <ListTree/>,
        name: 'navigator',
        onClick:()=>{}
    }
}