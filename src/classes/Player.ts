import * as THREE from 'three';
import { GameComponent } from '../app/game/game.component';
import { CharacterControls } from './PlayerControl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Planet } from './Planet';
import { degrees_to_radians, getDistance } from '../helpers';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const loader =  new GLTFLoader();

export class Player extends THREE.Object3D{
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private game:GameComponent;
  
  public size: number = 0.000001;

  constructor(game:GameComponent) {
    super();
    this.game = game  
    const self = this
    loader.load( 'assets/models/spaceship/scene.gltf', async function ( gltf:any ) {
      const model = gltf.scene.children[0].children[0].children[0].children[0].children[0]
      model.name = 'starship';
      model.rotateY(degrees_to_radians(180));
      model.scale.set(self.size, self.size, self.size);
      self.mesh.add(model);
      await self.game.renderer.compileAsync( self.mesh, self.game.cameraManager.camera, self.game.scene );

      self.add( self.mesh );
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
      planet.orbitCenter.position.x + planet.container.position.x,
      planet.orbitCenter.position.y + planet.container.position.y,
      planet.orbitCenter.position.z + planet.container.position.z,
    );

    var pos = new THREE.Vector3();
    pos.addVectors(planetPos, this.position);
    
    // this.game.cameraManager.camera.position.x = this.position.x
    // this.game.cameraManager.camera.position.z += this.position.y
    // this.game.cameraManager.camera.position.y += this.position.z

    // controls.target = planetPos;
    this.game.cameraManager.camera.lookAt(planetPos)
    // this.controls.rotate(-Math.PI / 4, 0);
    // this.mesh.quaternion.rotateTowards(planet.container.quaternion, 1)

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
    this.characterControls.updateCameraTarget(position.x, position.y, position.z);
  }

  public animate(updateDelta:number, keysPressed:any) {
    this.characterControls?.update(updateDelta, keysPressed);
  }

  public setTarget(target: Planet) {
    if (!this.characterControls) { return }
    this.characterControls.setTarget(target)
  }

}
