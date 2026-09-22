import { Position } from "./Draggable"

type Item = {
    name: string,
    type: ItemType,
    position: Position,
    // guid: 
}

enum ItemType {
    food,
    heldItem,
    evolutionItem,
}

export {type Item, ItemType};