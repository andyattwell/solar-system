import * as THREE from 'three';
import { GameComponent } from '../app/game/game.component';
import { CharacterControls } from './CharacterControl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader =  new GLTFLoader();

export class Player {
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private parent:GameComponent;
  
  public size: number = 0.001;

  constructor(parent:GameComponent) {
    this.parent = parent  
  }

  public get position() {
    return this.mesh.position
  }

  public set position(position:THREE.Vector3) {
    this.mesh.position.set(position.x, position.y, position.z)
  }

  public init() {
    // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    const self = this
    loader.load( 'assets/models/ufo/scene.gltf', async function ( gltf:any ) {


      const model = gltf.scene.children[0].children[0].children[0].children[0].children[0]
      model.rotateZ(90)
      model.scale.set(self.size, self.size, self.size)
      self.mesh.add(model)
      self.mesh.layers.set(1);
      await self.parent.renderer.compileAsync( self.mesh, self.parent.cameraManager.camera, self.parent.scene );
      
      self.parent.scene.add( self.mesh );
      self.characterControls = new CharacterControls(self.mesh, self.parent.cameraManager, 'Idle')
    },
    function ( xhr ) { /*called while loading is progressing */ }, 
    function ( error ) {
      console.error( error );
    });
    

  }


  public animate(updateDelta:number, keysPressed:any) {
    this.characterControls?.update(updateDelta, keysPressed);
  }
}