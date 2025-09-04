import { Meta, StoryObj } from "@storybook/nextjs-vite";
import Leftbar from "@components/leftbar";
import {PlusIcon, ListTree} from "lucide-react"


const meta:Meta<typeof Leftbar> = {
    title:'Leftbar',
    component: Leftbar,
    tags:['autodocs'],
    
    argTypes:{
        items:{
            control:{
                disable:true
            }
        }
    }
}

export default meta;

type Story = StoryObj<typeof meta>

export const Default:Story = {
    args:{
        items:[
            {
                icon:<PlusIcon/>,
                name:'components'
            },
            {
                icon:<ListTree/>,
                name:'navigator'
            },
        ]
    }
}