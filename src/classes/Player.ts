import * as THREE from 'three';
import { GameComponent } from '../app/game/game.component';
import { CharacterControls } from './PlayerControl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Planet } from './Planet';
import { createPositionHelper, degrees_to_radians, getDistance } from '../helpers';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const loader =  new GLTFLoader();

export class Player extends THREE.Object3D{
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private game:GameComponent;
  public lightIntensity = 1;
  public lightDistance = 10;
  public light = new THREE.PointLight(0x504030, this.lightIntensity, this.lightDistance);
  public size: number = 0.000001;
  public positionHelper:THREE.Object3D | undefined;

  constructor(game:GameComponent) {
    super();
    this.game = game  
    const self = this
    loader.load( 'assets/models/spaceship/scene.gltf', async function ( gltf:any ) {
      const model = gltf.scene.children[0].children[0].children[0].children[0].children[0]
      model.name = 'starship';
      model.rotateY(degrees_to_radians(180));
      model.scale.set(self.size, self.size, self.size);
      model.receiveShadow = true;
      model.castShadow = true; //default is false
      self.mesh.add(model);
      await self.game.renderer.compileAsync( self.mesh, self.game.cameraManager.camera, self.game.scene );

      self.add( self.mesh );
      self.add(self.light)

      self.game.scene.add( self );
      self.characterControls = new CharacterControls(self, self.game.cameraManager, 'Idle')
    },
    function ( xhr ) { /*called while loading is progressing */ }, 
    function ( error ) {
      console.error( error );
    });
  }

  public lookAtPlanet(planet: Planet, controls: OrbitControls){
    if (!this.characterControls) return;

    const planetPos: THREE.Vector3 = new THREE.Vector3(
      planet.orbitCenter.position.x + planet.position.x,
      planet.orbitCenter.position.y + planet.position.y,
      planet.orbitCenter.position.z + planet.position.z,
    );

    var pos = new THREE.Vector3();
    pos.addVectors(planetPos, this.position);
    
    // this.game.cameraManager.camera.position.x = this.position.x
    // this.game.cameraManager.camera.position.z += this.position.y
    // this.game.cameraManager.camera.position.y += this.position.z

    // controls.target = planetPos;
    this.game.cameraManager.camera.lookAt(planetPos)
    // this.controls.rotate(-Math.PI / 4, 0);
    // this.mesh.quaternion.rotateTowards(planet.quaternion, 1)

    // Get rotation angle
    let cat1 = Math.abs(planetPos.x - this.game.cameraManager.camera.position.x);
    let cat2 = Math.abs(planetPos.z - this.game.cameraManager.camera.position.z);
    let hypotenuse = Math.pow(cat1, 2) + Math.pow(cat2, 2);
    hypotenuse = Math. sqrt(hypotenuse);

    let sinX = cat1/cat2
    let deg = Math.sin(sinX) * -1;

    // console.log({deg})
    // console.log(controls.getAzimuthalAngle())

    controls.rotate(deg, 0);

    // this.characterControls.updateCameraTarget(planetPos.x, planetPos.z, planetPos.y)
  }

  public goToPlanet(planet: Planet) { 
    this.setTarget(planet);
  }

  public setPosition(position: THREE.Vector3, margin: number = 0) {
    this.position.set(position.x + margin, position.y, position.z + margin);
    this.characterControls?.updateCameraTarget(position.x, position.y, position.z);
  }

  public animate(updateDelta:number, keysPressed:any) {
    this.characterControls?.update(updateDelta, keysPressed);
  }

  public setTarget(target: Planet) {
    if (!this.characterControls) { return }
    // this.characterControls.setTarget(target);
    // console.log('target', target.position)
    this.setPosition(target.position, target.size);
    
    // Rotate ship to look at planet. Doesn't work

    // const rotateAngle = new THREE.Vector3(0, 1, 0)
    // const rotateQuarternion = new THREE.Quaternion();

    // const angleYDirection = Math.atan2(
    //   (target.position.x - this.mesh.position.x),
    //   (target.position.z - this.mesh.position.z)
    // )
    // console.log('angleYDirection', angleYDirection)
    // console.log('rotationY 1', this.rotation.y)

    // this.rotateY(angleYDirection)
    // this.rotation.y = angleYDirection;
    // console.log('rotationY 2', this.rotation.y)

    // rotateQuarternion.setFromAxisAngle(
    //   rotateAngle,
    //   angleYDirection
    // )
    
    // this.quaternion.rotateTowards(rotateQuarternion, 1)
  }

  public changeLightIntensity(lightIntensity: number) {
    this.lightIntensity = lightIntensity;
    this.light.intensity = this.lightIntensity;
  }

  public changeLightDistance(lightDistance: number) {
    this.lightDistance = lightDistance;
    this.light.distance = this.lightDistance;
  }

  public changeSize(size: number) {

  }

  
  private removePositionHelpers() {
    if (this.positionHelper) {
      console.log('Remove helper');
      this.mesh.remove(this.positionHelper);
      this.positionHelper = undefined;
    }
  }

  public togglePositionHelper() {
    if (this.positionHelper) {
      this.removePositionHelpers();
    } else {
      console.log('Add helper');
      this.positionHelper = createPositionHelper(this.size * 10000);
      this.mesh.add(this.positionHelper);
    }
  }

  public lookAtShip () {
    this.game.cameraManager.lookAtObject(this)
  }
}
