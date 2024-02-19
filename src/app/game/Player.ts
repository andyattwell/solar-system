import * as THREE from 'three';
import { GameComponent } from './game.component';
import { CharacterControls } from './CharacterControl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader =  new GLTFLoader();

export class Player {
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private parent:GameComponent;
  public camera!:THREE.PerspectiveCamera;
  private keysPressed: any = {};
  public size: number = 0.005;

  constructor(parent:GameComponent) {
    this.parent = parent  
    // this.init();
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
      const scaleFactor = 0.005
      model.scale.set(scaleFactor,scaleFactor,scaleFactor)

      // self.mesh.position.set(75,0,5);
      self.mesh.layers.set(1);
      self.mesh.add(model)
      await self.parent.renderer.compileAsync( self.mesh, self.parent.cameraManager.camera, self.parent.scene );

      // const light_2 = new THREE.DirectionalLight(0xFFFFFF);
      // light_2.position.set(0.1, 0.1, 0.1)
      // light_2.intensity = 3
      // light_2.castShadow = true;
      // self.mesh.add(light_2)

      self.parent.scene.add( self.mesh );


      self.characterControls = new CharacterControls(self.mesh, self.parent.cameraManager, 'Idle')

    
    },
    function ( xhr ) { /*called while loading is progressing */ }, 
    function ( error ) {
      console.error( error );
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.shiftKey && self.characterControls) {
            self.characterControls.switchRunToggle()
        } else {
            (self.keysPressed as any)[event.key.toLowerCase()] = true
        }
    }, false);
    document.addEventListener('keyup', (event) => {
        (self.keysPressed as any)[event.key.toLowerCase()] = false
    }, false);
  }


  public animate(updateDelta:number) {
    this.characterControls?.update(updateDelta, this.keysPressed);
  }
}