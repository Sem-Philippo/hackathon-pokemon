import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Shop, type ShopItem } from "./Shop";
import { ItemType } from "@/components/types/Items";

const shopItems: ShopItem[] = [
  {
    id: "oran_berry",
    label: "Oran Berry",
    cost: 25,
    icon: "🍊",
    item: {
      name: "Oran_Berry",
      type: ItemType.food,
      size: { width: 40, height: 40 },
    },
  },
  {
    id: "sitrus_berry",
    label: "Sitrus Berry",
    cost: 40,
    icon: "🍋",
    item: {
      name: "Sitrus_Berry",
      type: ItemType.food,
      size: { width: 40, height: 40 },
    },
  },
];

const meta = {
  title: "Organisms/Shop",
  component: Shop,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: {
      include: ["items", "onBuy", "panelWidth", "title"],
    },
  },
  args: {
    items: shopItems,
    onBuy: () => undefined,
    title: "Shop",
    panelWidth: "24rem",
  },
  argTypes: {
    onBuy: { action: "bought" },
  },
} satisfies Meta<typeof Shop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open shop" }));
  },
};
