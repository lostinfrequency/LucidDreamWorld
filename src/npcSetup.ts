import * as npcLib from 'dcl-npc-toolkit'
import { NpcAnimationNameType, REGISTRY } from './registry'
import { RemoteNpc, hideThinking } from './remoteNpc'
import { FollowPathData } from 'dcl-npc-toolkit/dist/types'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { connectNpcToLobby } from './lobby-scene/lobbyScene'
import { genericPrefinedQuestions } from './NPCs/customUIFunctionality'
import { closeCustomUI, openCustomUI } from './NPCs/customUi'
import { ColliderLayer, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { CONFIG } from './config'

const FILE_NAME: string = "npcSetup.ts"

const Light_NPC_ANIMATIONS: NpcAnimationNameType = {
  HI: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  IDLE: { name: "EmptydISCObALLAction", duration: 4, autoStart: undefined },
  TALK: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  THINKING: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  LOADING: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  LAUGH: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  HAPPY: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  SAD: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
  SURPRISE: { name: "EmptydISCObALLAction", duration: 2, autoStart: undefined },
}

export function setupNPC(endCloudData: any) {
  console.log("setupNPC", "ENTRY")

  createLight(endCloudData)

  for (const p of REGISTRY.allNPCs) {
    //TODO: Set Display text to center
    console.error("Check:" + FILE_NAME + 184);
    //p.npc.dialog.text.hTextAlign = 'center'
  }

  console.log("setupNPC", "RESOLVED")
}

function createLight(endCloudData: any) {
  let light: RemoteNpc
  light = new RemoteNpc(
    { resourceName: "workspaces/default-efhuj7ts7dcdjcrqj7_yzq/characters/white_light" },
    {
      transformData: { position: Vector3.create(endCloudData.x+6, endCloudData.y+5, endCloudData.z+6), scale: Vector3.create(1, 1, 1) },
      npcData: {
        type: npcLib.NPCType.CUSTOM,
        model: {
          src: 'models/lightBall.glb',
          visibleMeshesCollisionMask: ColliderLayer.CL_NONE,
          invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS
        },
        onActivate: () => {
          console.log('light.NPC activated!')
          connectNpcToLobby(REGISTRY.lobbyScene, light)
        },
        onWalkAway: () => {
          closeCustomUI(false)//already in walkaway dont trigger second time
          hideThinking(light)
          if (REGISTRY.activeNPC === light) REGISTRY.activeNPC = undefined
          console.log("NPC", light.name, 'on walked away')
          const NO_LOOP = true
          //if (light.npcAnimations.SAD) npcLib.playAnimation(light.entity, light.npcAnimations.SAD.name, true, light.npcAnimations.SAD.duration)
        },
        idleAnim: Light_NPC_ANIMATIONS.IDLE.name,

        faceUser: true,
        /*portrait:
        {
          path: Light_NPC_ANIMATIONS.IDLE.portraitPath, height: 320, width: 320
          , offsetX: -60, offsetY: -40
          , section: { sourceHeight: 384, sourceWidth: 384 }
        },*/
        darkUI: true,
        coolDownDuration: 3,
        hoverText: 'Talk',
        onlyETrigger: true,
        onlyClickTrigger: false,
        onlyExternalTrigger: false,
        reactDistance: 5,
        continueOnWalkAway: false,
      }
    },
    {
      npcAnimations: Light_NPC_ANIMATIONS,
      thinking: {
        enabled: true,
        modelPath: 'models/loading-icon.glb',
        offsetX: 0,
        offsetY: 2.3,
        offsetZ: 0
      }
      , onEndOfRemoteInteractionStream: () => {
        openCustomUI()
      }
      , onEndOfInteraction: () => { },
      predefinedQuestions: genericPrefinedQuestions
    }
  )

  light.name = "npc.light"
  REGISTRY.allNPCs.push(light)
}

function createDebugEntity(text: string, position: Vector3) {
  if (!CONFIG.PATH_DEBUG) return
  let test = engine.addEntity()
  Transform.create(test, {
    position: position,
    scale: Vector3.create(.25, .25, .25)
  })
  TextShape.create(test, {
    text: text,
    textColor: Color4.Black()
  })
}