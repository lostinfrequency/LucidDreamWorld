import { Entity, engine, Transform, MeshRenderer, Material, GltfContainer } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { height, sceneSizeX, sceneSizeZ, radiusMultiplier } from './resources'

let skyboxRoot1 = engine.addEntity()
let skyboxRoot2 = engine.addEntity()

const ForestFloor = engine.addEntity()
GltfContainer.create(ForestFloor, {
  src: 'models/forestFloor.glb',
})
Transform.create(ForestFloor, { position: Vector3.create(48, 48, 48) })

export const setup360 = (folderNumber: string): Entity => {

    //root
  let skyboxRoot: Entity// = engine.addEntity()

  switch (folderNumber) {
    case "1":
      skyboxRoot = skyboxRoot1
      //engine.removeEntity(skyboxRoot1)
    break
    case "2":
      engine.removeEntity(skyboxRoot1)
      engine.removeEntity(ForestFloor)
      skyboxRoot = skyboxRoot2
      const cloudFloor = engine.addEntity()
      GltfContainer.create(cloudFloor, {
        src: 'models/cloudFloor.glb',
      })
      Transform.create(cloudFloor, { position: Vector3.create(48, 48, 48) })
    break
    default:
    break
  }


  Transform.create(skyboxRoot, { position: Vector3.create(sceneSizeX / 2, height / 2, sceneSizeZ / 2) })

  //front
  let skyboxPZ = engine.addEntity()
  Transform.create(skyboxPZ, {
    position: Vector3.create(0, 0, sceneSizeZ / 2 * radiusMultiplier),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxPZ)
  Material.setBasicMaterial(skyboxPZ, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/pz.jpg"
    })
  })

  //back
  let skyboxNZ = engine.addEntity()
  Transform.create(skyboxNZ, {
    position: Vector3.create(0, 0, -sceneSizeZ / 2 * radiusMultiplier),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxNZ)
  Material.setBasicMaterial(skyboxNZ, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/nz.jpg"
    })
  })

  //Top
  let skyboxPY = engine.addEntity()
  Transform.create(skyboxPY, {
    position: Vector3.create(0, height / 2 * radiusMultiplier, 0),
    rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxPY)
  Material.setBasicMaterial(skyboxPY, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/py.jpg"
    })
  })

  //Bottom
  let skyboxNY = engine.addEntity()
  Transform.create(skyboxNY, {
    position: Vector3.create(0, -height / 2 * radiusMultiplier, 0),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxNY)
  Material.setBasicMaterial(skyboxNY, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/ny.jpg"
    })
  })

  //Right
  let skyboxPX = engine.addEntity()
  Transform.create(skyboxPX, {
    position: Vector3.create(sceneSizeX / 2 * radiusMultiplier, 0, 0),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxPX)
  Material.setBasicMaterial(skyboxPX, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/px.jpg"
    })
  })

  // Left
  let skyboxNX = engine.addEntity()
  Transform.create(skyboxNX, {
    position: Vector3.create(-sceneSizeX / 2 * radiusMultiplier, 0, 0),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0),
    scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
    parent: skyboxRoot
  })
  MeshRenderer.setPlane(skyboxNX)
  Material.setBasicMaterial(skyboxNX, {
    texture: Material.Texture.Common({
      src: "images/skybox/" + folderNumber + "/nx.jpg"
    })
  })
  //#endregion

  return skyboxRoot
}
