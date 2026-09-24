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

const defaultShopBackground = "/media/shop/shop-panel.png";
const defaultItemBackground = "/media/items/item-card.png";
const openShopIcon = "/media/shop/shop-button-open.png";

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
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundColor: "#efe3d0",
      }
    : { backgroundImage: `url("${defaultShopBackground}")`, backgroundSize: "100% 100%", backgroundPosition: "center", backgroundColor: "#efe3d0" };

  const itemCardStyle = (image?: string): CSSProperties =>
    image
      ? {
          backgroundImage: `url("${image}")`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "transparent",
        }
      : { backgroundImage: `url("${defaultItemBackground}")`, backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "transparent" };

  const closeShop = () => setIsOpen(false);
  const openShop = () => setIsOpen(true);

  return (
    <>
      {!isOpen ? (
        <Button
          variant="secondary"
          className="fixed top-1/2 z-60 flex h-24 w-24 -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 shadow-none [&>span]:flex [&>span]:h-full [&>span]:w-full"
          onClick={openShop}
          aria-label="Open shop"
          aria-expanded={false}
          aria-controls="shop-drawer"
          style={{
            padding: "0px",
            position: "fixed",
            top: "50%",
            left: "auto",
            right: "1.25rem",
            transform: "translateY(-50%)",
          }}
        >
          <img
            src={openShopIcon}
            alt="Open shop"
            className="block h-full w-full object-cover"
          />
        </Button>
      ) : null}
      

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
          className="flex h-full w-full flex-col border-l border-stone-800/50 bg-stone-900/70 text-stone-50"
          style={shopStyle}
        >
          <div className="h-full w-full overflow-y-auto bg-stone-900/35 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>

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
                  className="relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden border-0 bg-transparent p-3 text-center shadow-none transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={itemCardStyle(itemBackgroundImage)}
                  aria-label={`Buy ${shopItem.label}`}
                >
                  <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center">
                    <img src={shopItem.icon} alt="" className="h-20 w-20 object-contain" />
                  </div>

                  <div className="relative z-10 min-w-0 max-w-full truncate text-sm font-semibold leading-tight text-white drop-shadow-sm">
                    {shopItem.label}
                  </div>
                  <div className="relative z-10 text-xs font-bold leading-tight text-amber-200 drop-shadow-sm">
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
