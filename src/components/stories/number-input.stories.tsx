import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import NumberInput from "@components/number-input";

const meta:Meta<typeof NumberInput> = {
    title:"Number Input",
    component:NumberInput,
    tags:['autodocs']
}

export default meta;

export const Default:StoryObj<typeof meta> = {
    args:{
        min:0,
        max:1000,
        defaultValue:1
    }
}

export const Controlled = () => {
    const [value, setValue] = useState<number>()
    return <NumberInput min={0} max={1000} value={value} onChange={setValue}/>
}