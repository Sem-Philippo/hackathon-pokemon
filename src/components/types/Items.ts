import { Position } from "./Draggable"

type Item = QueuedItem & {
    position: Position,
    uuid: string,
    claimedBy?: string, // uuid of pokemon or name of pokemon
    wasUsed: boolean,
}

type QueuedItem = {
    name: string,
    type: ItemType,
    size: Size,
}

type Size = {
    width: number,
    height: number,
}

enum ItemType {
    food,
    heldItem,
    evolutionItem,
    egg,
}

enum FoodItem {
    Oran_Berry,
    Pecha_Berry,
    Cheri_Berry,
    Rawst_Berry,
    Chesto_Berry,
    Aspear_Berry,
    Sitrus_Berry,
    Lum_Berry,
}

export {type QueuedItem, type Item, type Size, ItemType, FoodItem};