import { Vector3, Quaternion } from '@dcl/sdk/math'
import { engine, GltfContainer, Transform, Animator, PointerEvents, PointerEventType, InputAction, inputSystem, AudioSource, Entity } from '@dcl/sdk/ecs'
import { Enemy, Weapon } from './definitions'
import { Room } from 'colyseus.js'
import { setup360 } from './360viewSetup'

const ENEMY_MODEL_PATH = 'models/ghost.glb'
const ATTACK_DISTANCE = 4
const MOVEMENT_SPEED = 3
const ROTATION_SPEED = 1

let enemyEntity: Entity
let roomPointer: Room

export function createEnemy(position: Vector3, room: Room) {
  roomPointer = room
  enemyEntity = engine.addEntity()
  Transform.create(enemyEntity, {
    position
  })
  GltfContainer.create(enemyEntity, {
    src: ENEMY_MODEL_PATH
  })
  Animator.create(enemyEntity, {
    states: [
      {
        name: 'Walking',
        clip: 'MagicHand2',
        playing: true,
        loop: true
      },
      {
        name: 'Attacking',
        clip: 'Punch1',
        loop: true
      }
    ]
  })
  Enemy.create(enemyEntity, {
    movementSpeed: MOVEMENT_SPEED,
    rotationSpeed: ROTATION_SPEED
  })

}

let nightmareReachedPlayer = false
let timer: number = 1

function enemyMovementSystem(deltaTime: number) {
  if(nightmareReachedPlayer===false){
  if (!Transform.has(engine.PlayerEntity)) return
  const playerPos = Transform.get(engine.PlayerEntity).position

  for (const [entity] of engine.getEntitiesWith(Enemy)) {
    const transform = Transform.getMutable(entity)

    // Rotate to face player
    const lookAtTarget = Vector3.create(playerPos.x, transform.position.y, playerPos.z)
    const lookAtDirection = Vector3.subtract(lookAtTarget, transform.position)
    transform.rotation = Quaternion.slerp(
      transform.rotation,
      Quaternion.lookRotation(lookAtDirection),
      ROTATION_SPEED + deltaTime
    )

    // Move towards player until it's at attack distance
    const distance = Vector3.distanceSquared(transform.position, playerPos) // Check distance squared as it's more optimized

    const isInAttackDistance = distance < ATTACK_DISTANCE
    if (!isInAttackDistance) {
      const forwardVector = Vector3.rotate(Vector3.Forward(), transform.rotation)
      const positionDelta = Vector3.scale(forwardVector, MOVEMENT_SPEED * deltaTime)
      transform.position = Vector3.add(transform.position, positionDelta)
    } else {
      nightmareReachedPlayer = true
      for (const [enemyEntity] of engine.getEntitiesWith(Enemy)) {
        PointerEvents.deleteFrom(enemyEntity)
      }
      for (const [entity] of engine.getEntitiesWith(Weapon)) {
        engine.removeEntity(entity)
      }
      state.grabbed = false
    }

    Animator.getClip(entity, 'Walking').playing = !isInAttackDistance
    Animator.getClip(entity, 'Attacking').playing = isInAttackDistance
  }
} else {
  console.log('in delay timer')
  timer -= deltaTime
  if (timer <= 0) {
    console.log('delay timer works!!! ')
    timer = 1
    roomPointer.send("resetGameplay");
    nightmareReachedPlayer = false
    for (const [enemyEntity] of engine.getEntitiesWith(Enemy)) {
      engine.removeEntity(enemyEntity)
    }
  }
}
}
engine.addSystem(enemyMovementSystem)


function enemyKiller() {
  for (const [enemyEntity] of engine.getEntitiesWith(Enemy)) {
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, enemyEntity)) {
      console.log('BOOM!!! ', enemyEntity)

      if(nightmareReachedPlayer===false){
      const enemyTransform = Transform.getOrNull(enemyEntity)
      if (enemyTransform) {
        const soundEntity = engine.addEntity()
        Transform.create(soundEntity).position = enemyTransform.position
        //playSound(soundEntity, 'sounds/explosion.mp3', true)
      }
      const folderNumber = "2"
      setup360(folderNumber)
      roomPointer.send("setupCloudRun", Transform.get(enemyEntity));
      engine.removeEntity(enemyEntity)
      for (const [entity] of engine.getEntitiesWith(Weapon)) {
        engine.removeEntity(entity)
      }
    }
    } 
  }
}
engine.addSystem(enemyKiller)




/////////// WEAPON START ///////////////////////////////////////////////////////////////////////

export function createWeapon(Position: Vector3): Entity {
  const weapon = engine.addEntity()
  Transform.create(weapon, { position: Position })
  GltfContainer.create(weapon, { src: `models/Gun_01.glb` })

  PointerEvents.create(weapon, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_PRIMARY,
          hoverText: 'Pick Up / Put Down',
          maxDistance: 5,
          showFeedback: true
        }
      }
    ]
  })

  Weapon.create(weapon, {})

  return weapon
}



const audioSourceEntity = engine.addEntity()
export function playSound(audio: string) {
  AudioSource.createOrReplace(audioSourceEntity, {
    audioClipUrl: audio,
    playing: true
  })
}

const Z_OFFSET = 1
  const GROUND_HEIGHT = 49
const state = {
  grabbed: false
}
const toggleGrabbed = () => {
  state.grabbed = !state.grabbed
  const sound = state.grabbed ? `sounds/put-down.mp3` : `sounds/pick-up.mp3`
  playSound(sound)

  return state.grabbed
}


export function grabbingSystem() {
  const objs = engine.getEntitiesWith(PointerEvents, Transform)
  for (const [entity] of engine.getEntitiesWith(Weapon)) {
    const mutableTransform = Transform.getMutable(entity)
    if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
      const grabbed = toggleGrabbed()

      if (grabbed) {
        mutableTransform.position = Vector3.Zero()
        mutableTransform.rotation = Quaternion.Zero()
        mutableTransform.position.z += Z_OFFSET
        mutableTransform.parent = engine.PlayerEntity


        PointerEvents.create(enemyEntity, {
          pointerEvents: [
            {
              eventType: PointerEventType.PET_DOWN,
              eventInfo: {
                button: InputAction.IA_POINTER,
                hoverText: 'Attack'
              }
            }
          ]
        })

      } else {
        mutableTransform.parent = undefined
        const camera = Transform.getOrNull(engine.CameraEntity)
        if (!camera) return

        const forwardVector = Vector3.rotate(Vector3.scale(Vector3.Forward(), Z_OFFSET), camera.rotation)
        mutableTransform.position = Vector3.add(camera.position, forwardVector)
        mutableTransform.rotation.x = 0
        mutableTransform.rotation.z = 0
        mutableTransform.position.y = GROUND_HEIGHT

        PointerEvents.deleteFrom(enemyEntity)

      }
    }
  }
}

engine.addSystem(grabbingSystem)
