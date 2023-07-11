import { engine, GltfContainer, MeshRenderer, PointerEvents, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { initRegistery, REGISTRY } from './registry'
import { initDialogs } from './waitingDialog'
import { setupNPC } from './npcSetup'
import { LobbyScene } from './lobby-scene/lobbyScene'
import { Room } from 'colyseus.js'
import { onNpcRoomConnect } from './connection/onConnect'
import "./polyfill/delcares";
import { initConfig } from './config'
import { setUpUI as setupUI } from './ui'
import { initIdleStateChangedObservable, onIdleStateChangedObservableAdd } from './back-ports/onIdleStateChangedObservables'


import { MeshCollider, InputAction, Material, PointerEventType, inputSystem, pointerEventsSystem } from '@dcl/sdk/ecs'
import { movePlayerTo } from '~system/RestrictedActions'
import { Quaternion} from '@dcl/sdk/math'
import { height, sceneSizeX, sceneSizeZ, radiusMultiplier } from './resources'

import { initGamePlay } from "./gameplay";

import "./polyfill/delcares";
//import { initStatic } from "./scene";
import { setup360 } from './360viewSetup'
import { Bed } from './definitions'

// export all the functions required to make the scene work
export * from '@dcl/sdk'
/*
const floor = engine.addEntity()
MeshRenderer.setBox(floor)
Transform.create(floor, {
  position: Vector3.create(16 / 2, .1, 16 / 2),
  scale: Vector3.create(16, .1, 16)
})

initRegistery()
initConfig()
initDialogs()

REGISTRY.lobbyScene = new LobbyScene()

setupNPC()


REGISTRY.onConnectActions = (room: Room<any>, eventName: string) => {
  //npcConn.onNpcRoomConnect(room)
  onNpcRoomConnect(room)
}
initIdleStateChangedObservable() 
onIdleStateChangedObservableAdd((isIdle:boolean)=>{
  if(isIdle){ 
    console.log("index.ts","onIdleStateChangedObservableAdd","player is idle")
  }else{
    console.log("index.ts","onIdleStateChangedObservableAdd","player is active")
  }
})

setupUI()
*/


//Cloud jumping import
// Import the custom gameplay code.


// export all the functions required to make the scene work
export * from '@dcl/sdk'

export function main(){
    //initStatic() 
    initGamePlay() 




//#region SkyBox
const folderNumber = "1"

setup360(folderNumber)


movePlayerTo({ newRelativePosition: Vector3.create(48, 51, 48) })



const innerBarrier = engine.addEntity()
GltfContainer.create(innerBarrier, {
  src: 'models/skyboxinnerbarrier.glb',
})
Transform.create(innerBarrier, { position: Vector3.create(48, 48, 48) })





const clickableEntity2 = engine.addEntity()
MeshRenderer.setBox(clickableEntity2)
MeshCollider.setBox(clickableEntity2)
Transform.create(clickableEntity2, { position: Vector3.create(sceneSizeX / 2, 1, sceneSizeZ / 2) })

pointerEventsSystem.onPointerDown(
  {
    entity: clickableEntity2, opts: {
      button: InputAction.IA_POINTER,
      hoverText: 'Reset'
    }
  }
  ,
  function () {
    movePlayerTo({ newRelativePosition: Vector3.create(sceneSizeX / 2, height / 2 + 2, sceneSizeZ / 2) })
  }
)


}