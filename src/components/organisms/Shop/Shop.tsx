"use client";

import { useState, type CSSProperties } from "react";
import Button from "@/components/atoms/Button/Button";
import { type QueuedItem } from "@/components/types/Items";

export type ShopItem = {
  id: string;
  label: string;
  cost: number;
  icon: string;
  item: QueuedItem;
};

type ShopProps = {
  items: ShopItem[];
  onBuy: (item: QueuedItem) => void;
  shopBackgroundImage?: string;
  itemBackgroundImage?: string;
  panelWidth?: string;
  title?: string;
};

const defaultShopBackground = "/media/shop/shop-panel.svg";
const defaultItemBackground = "/media/items/item-card.svg";
const openShopIcon = "/media/shop/shop-button-open.svg";
const closeShopIcon = "/media/shop/shop-button-close.svg";

const toggleOffset = (width: string) => ({
  right: `calc(${width} - 3.25rem)`,
});

function Shop({
  items,
  onBuy,
  shopBackgroundImage,
  itemBackgroundImage,
  panelWidth = "24rem",
  title = "Shop",
}: ShopProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shopStyle: CSSProperties = shopBackgroundImage
    ? {
        backgroundImage: `url("${shopBackgroundImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#efe3d0",
      }
    : { backgroundImage: `url("${defaultShopBackground}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#efe3d0" };

  const itemCardStyle = (image?: string): CSSProperties =>
    image
      ? {
          backgroundImage: `url("${image}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f4ecd9",
        }
      : { backgroundImage: `url("${defaultItemBackground}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#f4ecd9" };

  const closeShop = () => setIsOpen(false);
  const openShop = () => setIsOpen(true);

  return (
    <>
      <Button
        variant="secondary"
        className="fixed top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-xl border border-stone-700 bg-white/80 p-0 shadow-lg backdrop-blur-sm"
        onClick={isOpen ? closeShop : openShop}
        aria-label={isOpen ? "Close shop" : "Open shop"}
        aria-expanded={isOpen}
        aria-controls="shop-drawer"
        style={isOpen ? { ...toggleOffset(panelWidth), right: `calc(${panelWidth} - 3.25rem)` } : { right: "1.25rem" }}
      >
        <img
          src={isOpen ? closeShopIcon : openShopIcon}
          alt={isOpen ? "Close shop" : "Open shop"}
          className="h-9 w-9 object-contain"
        />
      </Button>

      <div
        aria-hidden={!isOpen}
        className={[
          "fixed inset-0 z-30 bg-black/20 transition-opacity duration-200",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={closeShop}
      />

      <div
        id="shop-drawer"
        role="dialog"
        aria-label={title}
        aria-modal="false"
        aria-hidden={!isOpen}
        className={[
          "fixed inset-y-0 right-0 z-40 flex transform transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{ width: panelWidth }}
      >
        <div
          className="flex h-full w-full flex-col border-l border-stone-800/50 bg-stone-900/70 text-stone-50 backdrop-blur-sm"
          style={shopStyle}
        >
          <div className="h-full w-full overflow-y-auto bg-stone-900/35 p-5 backdrop-blur-[2px]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-200/80">
                  Inventory
                </p>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                onClick={closeShop}
                aria-label="Close panel"
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {items.map((shopItem) => (
                <button
                  key={shopItem.id}
                  type="button"
                  onClick={() => {
                    onBuy(shopItem.item);
                    closeShop();
                  }}
                  className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-black/20 p-3 text-center shadow-lg transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={itemCardStyle(itemBackgroundImage)}
                  aria-label={`Buy ${shopItem.label}`}
                >
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-700/80 bg-white/50 shadow-inner">
                    <img src={shopItem.icon} alt="" className="h-12 w-12 object-contain" />
                  </div>

                  <div className="relative z-10 min-w-0 max-w-full truncate text-sm font-semibold text-white drop-shadow-sm">
                    {shopItem.label}
                  </div>
                  <div className="relative z-10 text-xs font-bold text-amber-200 drop-shadow-sm">
                    {shopItem.cost} coins
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { Shop };
export default Shop;
