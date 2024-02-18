import * as THREE from 'three';
import { GameComponent } from './game.component';
import { CharacterControls } from './CharacterControl';

export class Player {
  public characterControls!:CharacterControls;
  public mesh: THREE.Mesh = new THREE.Mesh();
  private parent:GameComponent;
  public camera!:THREE.PerspectiveCamera;
  private keysPressed:any = {}
  public size: number = 0.005

  constructor(parent:GameComponent) {
    this.parent = parent  
    this.init();
  }

  public get position() {
    return this.mesh.position
  }

  public set position(position:THREE.Vector3) {
    this.mesh.position.set(position.x, position.y, position.z)
  }

  private init() {
    // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    
    var geometry = new THREE.BoxGeometry( this.size, this.size, this.size );
    var material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.set(75,0,5);
    this.characterControls = new CharacterControls(this.mesh, this.parent.cameraManager, 'Idle')

    const self = this;
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
    this.characterControls.update(updateDelta, this.keysPressed);
  }
}