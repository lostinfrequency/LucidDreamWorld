import * as utils from '@dcl-sdk/utils'
//import * as ui from '@dcl/ui-scene-utils';
import { connect } from "./connection";
//import { floor } from './scene';
import { ambienceSound, clickSound, fallSound, finishSound1, finishSound2, newLeaderSound, countdownRestartSound, playLoop, playOnce, playOnceRandom } from './sound';
import { log } from './back-ports/backPorts';
import { AudioSource, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, PointerEventType, PointerEvents, Transform, engine, inputSystem } from '@dcl/sdk/ecs';
import { Vector3 } from '@dcl/sdk/math';
import { addRepeatTrigger } from './Utils';
import { Room } from 'colyseus.js';
import { initIdleStateChangedObservable, onIdleStateChangedObservableAdd } from './back-ports/onIdleStateChangedObservables';
import { initConfig } from './config';
import { onNpcRoomConnect } from './connection/onConnect';
import { LobbyScene } from './lobby-scene/lobbyScene';
import { setupNPC } from './npcSetup';
import { initRegistery, REGISTRY } from './registry';
import { initDialogs } from './waitingDialog';
import { setUpUI as setupUI } from './ui'
import { createEnemy, createWeapon } from './enemy'
import { Bed, Enemy, House, Weapon } from './definitions';
import { movePlayerTo } from '~system/RestrictedActions';


export function initGamePlay(){
    // play ambient music
    playLoop(ambienceSound, 0.4);


//
// Connect to Colyseus server! 
// Set up the scene after connection has been established.
//
connect("my_room").then((room) => {
    log("Connected!");

    const startHouse = engine.addEntity()
    GltfContainer.create(startHouse, {
      src: 'models/house.glb',
    })
    Transform.create(startHouse, { position: Vector3.create(48, 48, 48) })
    House.create(startHouse, {})

    
    const bed = engine.addEntity()
    Transform.create(bed, { position: Vector3.create(52, 48, 49) })
    GltfContainer.create(bed, { src: `models/BedKing.glb` })
    Bed.create(bed, {})
    
    PointerEvents.create(bed, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_PRIMARY,
            hoverText: 'Go to sleep',
            maxDistance: 5,
            showFeedback: true
          }
        }
      ]
    })

    engine.addSystem(() => {
        for (const [entity] of engine.getEntitiesWith(Bed)) {
          if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
            console.log('Going to sleeeeeep!!! ')
            createEnemy(Vector3.create(67, 48, 44), room)
            createWeapon(Vector3.create(49, 48.50, 28.25))

            for (const [entity] of engine.getEntitiesWith(Bed)) {
                engine.removeEntity(entity)
            }
            for (const [entity] of engine.getEntitiesWith(House)) {
                engine.removeEntity(entity)
            }

            //setup360(folderNumber)
          }
        }
      })

    let lastBlockTouched: number = 0;
    function onTouchBlock(y: number) {
        // send block index and player position to Colyseus server
        lastBlockTouched = y;
        room.send("touch-block", y);
    }


    // The "floor" object was originally named "entity" from the Decentraland Builder.
    // I exported it from the "./scene" file to be able to attach custom behaviour.
    //utils.triggers.enableDebugDraw(true)
    /*
    addRepeatTrigger(
        Vector3.create(16, 2, 16), Vector3.create(0, 0, 0),
        (entity:Entity) => { 
            log('player.enter.floorTriggerShape',entity)
            if (lastBlockTouched > 2 && lastBlockTouched < 55) {
                room.send("fall", Transform.get(engine.PlayerEntity).position);
            }
        },
        floor,
        false,
        () => {
            log('player.exit.floorTriggerShape')
        }
    )
    */
    /// --- Spawner function ---
    function spawnCube(x: number, y: number, z: number) {
        // create the entity
        const cloud = engine.addEntity()

        GltfContainer.create(cloud, {
            src: 'models/cloud.glb',
        })
        //MeshRenderer.setBox(cube)
        //MeshCollider.setBox(cube)
 
        // add a transform to the entity
        Transform.create(cloud,{ position: Vector3.create(x, y, z) })
        /*
        // set random color/material for the cube
        const cubeMaterial = new Material()
        cubeMaterial.albedoColor = Color3.Random();
        cubeMaterial.metallic = Math.random();
        cubeMaterial.roughness = Math.random();
        cube.addComponent(cubeMaterial);
        */
       
        addRepeatTrigger(
            Vector3.create(0.7, 1, 0.7),// position,
             Vector3.create(0, 2.2, 0), // size
            (entity:Entity) => {
                log('player.enter.touch.cube',entity)
                onTouchBlock(y);
            },
            cloud,
            false,
            () => {
                //log('player.exit.touch.cube')
            }
        )

        utils.tweens.startScaling(cloud,
            Vector3.create(0, 0, 0), Vector3.create(1, 1, 1),.2
            )
        
        // play click sound
        AudioSource.createOrReplace(cloud,
            {
                audioClipUrl:"sounds/click.mp3",
                loop:false,
                playing:true
            })

        return cloud;
    }

    //
    // -- Colyseus / Schema callbacks -- 
    // https://docs.colyseus.io/state/schema/
    //
    let allBoxes: Entity[] = []; 
    let lastBox: Entity;
    room.state.blocks.onAdd = (block: any, i: number) => {
        log("room.state.blocks.onAdd","ENTRY")
        lastBox = spawnCube(block.x, block.y, block.z);
        allBoxes.push(lastBox);
    };

    let highestRanking = 0;
    let highestPlayer: any = undefined;
    room.state.players.onAdd = (player: any, sessionId: string) => {
        player.listen("ranking", (newRanking: number) => {
            if (newRanking > highestRanking) {
                if (player !== highestPlayer) {
                    highestPlayer = player;

                    playOnce(newLeaderSound);
                }
                highestRanking = newRanking;
            }

        });
    }

    room.state.players.onRemove = () => {
    }


    //room.onMessage("startDream", () => {
    //    createEnemy(Vector3.create(67, 48, 44), room)
    //    createWeapon(Vector3.create(67, 48, 44))
    //})

    room.onMessage("resetGame", () => {



        const startHouse = engine.addEntity()
        GltfContainer.create(startHouse, {
          src: 'models/house.glb',
        })
        Transform.create(startHouse, { position: Vector3.create(48, 48, 48) })
        House.create(startHouse, {})
        
        const bed = engine.addEntity()
        Transform.create(bed, { position: Vector3.create(52, 48, 49) })
        GltfContainer.create(bed, { src: `models/BedKing.glb` })
        Bed.create(bed, {})
        
        PointerEvents.create(bed, {
          pointerEvents: [
            {
              eventType: PointerEventType.PET_DOWN,
              eventInfo: {
                button: InputAction.IA_PRIMARY,
                hoverText: 'Go to sleep',
                maxDistance: 5,
                showFeedback: true
              }
            }
          ]
        })
      
        movePlayerTo({ newRelativePosition: Vector3.create(48, 51, 48) })
    })

    room.onMessage("start", () => {
        log("room.onMessage.start","ENTRY")
        // remove all previous boxes
        allBoxes.forEach((box) => engine.removeEntity(box));
        allBoxes = [];

        lastBlockTouched = 0;
        highestRanking = 0;
        highestPlayer = undefined;

    });

    room.onMessage("fall", (atPosition) => {
        playOnce(fallSound, 1, Vector3.create(atPosition.x, atPosition.y, atPosition.z));
    })

    room.onMessage("cloudLevelInitiate", (endCloudData) => {
        try{
            //ui.displayAnnouncement(`${highestPlayer.name} wins!`, 8, Color4.White(), 60);
            log("cloudLevelInitiate",`${highestPlayer?.name} wins!`)
            playOnceRandom([finishSound1, finishSound2]);
            const endCoud = engine.addEntity()
            GltfContainer.create(endCoud, {
                src: 'models/endCloud.glb',
            })
            Transform.createOrReplace(endCoud,{ position: Vector3.create(endCloudData.x+6, endCloudData.y+1.25, endCloudData.z+6) })


            initRegistery()
            initConfig()
            initDialogs()

            REGISTRY.lobbyScene = new LobbyScene()

            setupNPC(endCloudData)


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

            
        }catch(e){
            console.log("room.onMessage.finished","caught error",e)
            console.error(e)
        }
    
    });

    room.onMessage("restart", () => {
        playOnce(countdownRestartSound);
    });

    room.onLeave((code) => {
        log("onLeave, code =>", code);
    });

}).catch((err) => {
    //error(err);
    console.error(err)

});

}