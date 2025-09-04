import { Meta, StoryObj } from "@storybook/nextjs-vite";
import Canvas from "@components/canvas";

const meta:Meta<typeof Canvas> ={
    title:'Canvas',
    component: Canvas,
    tags: ['autodocs']
}

export default meta;

export const Default:StoryObj<typeof meta> = {

}