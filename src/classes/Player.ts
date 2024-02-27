import * as THREE from 'three';
import { GameComponent } from '../app/game/game.component';
import { CharacterControls } from './PlayerControl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Planet } from './Planet';
import { degrees_to_radians, getDistance } from '../helpers';

const loader =  new GLTFLoader();

export class Player extends THREE.Object3D{
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private game:GameComponent;
  
  public size: number = 0.000001;

  constructor(game:GameComponent) {
    super();
    this.game = game  
  }

  public init() {
    const self = this
    loader.load( 'assets/models/spaceship/scene.gltf', async function ( gltf:any ) {
      const model = gltf.scene.children[0].children[0].children[0].children[0].children[0]
      model.name = 'starship';
      model.rotateY(degrees_to_radians(180));
      model.scale.set(self.size, self.size, self.size)
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

  public animate(updateDelta:number, keysPressed:any) {
    this.characterControls?.update(updateDelta, keysPressed);
  }

  public setTarget(target: Planet) {
    if (!this.characterControls) { return }
    this.characterControls.setTarget(target)
  }

}
