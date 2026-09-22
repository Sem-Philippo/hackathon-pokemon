import { Position } from "./Draggable"

type Item = QueuedItem & {
    position: Position,
    uuid: string,
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
}

export {type QueuedItem, type Item, type Size, ItemType};