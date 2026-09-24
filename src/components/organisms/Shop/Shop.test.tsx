import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Shop, type ShopItem } from "./Shop";
import { ItemType } from "@/components/types/Items";

const shopItems: ShopItem[] = [
  {
    id: "oran-berry",
    label: "Oran Berry",
    cost: 25,
    icon: "🍊",
    item: {
      name: "Oran_Berry",
      type: ItemType.food,
      size: { width: 40, height: 40 },
    },
  },
];

test("opens and closes the shop drawer", async () => {
  const screen = await render(<Shop items={shopItems} onBuy={vi.fn()} />);
  const getShopDialog = () =>
    document.querySelector('#shop-drawer[role="dialog"][aria-label="Shop"]');

  await expect.element(screen.getByRole("button", { name: "Open shop" })).toBeVisible();
  expect(getShopDialog()).not.toBeNull();
  expect(getShopDialog()).toHaveAttribute("aria-hidden", "true");

  await screen.getByRole("button", { name: "Open shop" }).click();
  await expect.element(screen.getByRole("dialog", { name: "Shop" })).toBeVisible();
  await expect.element(screen.getByRole("dialog", { name: "Shop" })).toHaveAttribute("aria-hidden", "false");

  await screen.getByRole("button", { name: "Close shop" }).click();
  expect(getShopDialog()).not.toBeNull();
  expect(getShopDialog()).toHaveAttribute("aria-hidden", "true");
});

test("buying an item calls the callback with the queued item", async () => {
  const onBuy = vi.fn();
  const screen = await render(<Shop items={shopItems} onBuy={onBuy} />);

  await screen.getByRole("button", { name: "Open shop" }).click();
  await screen.getByRole("button", { name: "Buy Oran Berry" }).click();

  expect(onBuy).toHaveBeenCalledTimes(1);
  expect(onBuy).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Oran_Berry",
      type: ItemType.food,
    }),
  );
});
