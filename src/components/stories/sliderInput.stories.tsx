import { Meta, StoryObj } from "@storybook/nextjs-vite";
import SliderInput from "../sliderInput";

const meta:Meta<typeof SliderInput> = {
    title:"Slider Input",
    component:SliderInput,
    tags:['autodocs']
}

export default meta;

export const Default:StoryObj<typeof meta> = {
    args:{
        min:0,
        max:1000,
        threshold:3
    }
}