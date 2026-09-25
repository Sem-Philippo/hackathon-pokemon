import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { PageTemplate } from "./PageTemplate";

const meta = {
  title: "Templates/PageTemplate",
  component: PageTemplate,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: {
      include: ["children"],
    },
  },
  args: {
    children: <p>Page content</p>,
  },
} satisfies Meta<typeof PageTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Pokedachi" }),
    ).toBeVisible();
    await expect(canvas.getByText("Page content")).toBeVisible();
  },
};
