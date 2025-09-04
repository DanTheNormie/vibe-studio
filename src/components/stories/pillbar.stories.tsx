import Pillbar from "../pillbar"
import { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta:Meta<typeof Pillbar> = {
    title:'Pillbar',
    component:Pillbar,
    tags:['autodocs']
}

export default meta

export const Default:StoryObj<typeof meta> = {
    args:{
        resolution:{
            x:1366,
            y:768
        },
        scale:100
    }
}