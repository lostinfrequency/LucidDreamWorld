import { engine, Schemas } from '@dcl/sdk/ecs'

export const Enemy = engine.defineComponent('Enemy', {
  movementSpeed: Schemas.Number,
  rotationSpeed: Schemas.Number
})

export const Weapon = engine.defineComponent('Weapon', {
})

export const Bed = engine.defineComponent('Bed', {
})
export const House = engine.defineComponent('House', {
})