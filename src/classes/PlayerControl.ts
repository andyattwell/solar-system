import * as THREE from 'three'
import { A, D, DIRECTIONS, S, W, getDistance } from '../helpers'
import { CameraManager } from './CameraManager'
import { Planet } from './Planet'

export class CharacterControls {

  model: THREE.Object3D
  cameraManager?: CameraManager

  // state
  toggleRun: boolean = false
  toggleHyper: boolean = false;
  stop: boolean = false;
  currentAction: string

  // temporary data
  walkDirection = new THREE.Vector3()
  rotateAngle = new THREE.Vector3(0, 1, 0)
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
  cameraTarget = new THREE.Vector3()

  // constants
  fadeDuration: number = 0.2
  runVelocity = 1
  HyperVelocity = 50
  walkVelocity = 0.05
  acceleration = 0
  velocity = 0

  private target: Planet|undefined;

  constructor(
    model: THREE.Object3D,
    cameraManager: CameraManager,
    currentAction: string
  ) {
    this.model = model
    this.currentAction = currentAction
    this.cameraManager = cameraManager
  }

  public switchRunToggle() {
    this.toggleRun = !this.toggleRun
  }

  public switchHyperToggle() {
    this.toggleHyper = !this.toggleHyper
  }

  public break() {
    this.stop = true;
  }

  public releaseBreak() {
    this.stop = false
  }

  public update(delta: number, keysPressed: any) {
    if (!this.cameraManager) return;
    let distance = 0;
    if (this.target) {

      // Move to target
      // return this.moveTo(this.target.position, delta);
      const targetPosition = new THREE.Vector3(
        this.target.orbitCenter.position.x + this.target.position.x + this.target.size * 2,
        this.target.orbitCenter.position.y + this.target.position.y,
        this.target.orbitCenter.position.z + this.target.position.z + this.target.size * 2,
      )
      distance = getDistance(this.model.position, targetPosition);
      if (distance <= 1) {
        this.target = undefined;
        return;
      }
      this.currentAction = 'Hyper'
      keysPressed = this.getsKeysForTarget(targetPosition);
    } else {
      
      // Move by player input
      const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)
      if (directionPressed) {
        if (keysPressed.control) {
          this.currentAction = 'Hyper'
        } else if (this.toggleRun) {
          this.currentAction = 'Run'
        } else {
          this.currentAction = 'Walk'
        } 
      } else {
        this.currentAction = 'Idle'
      }
    }

    if (this.currentAction == 'Run' || this.currentAction == 'Hyper' || this.currentAction == 'Walk') {
      // diagonal movement angle offset
      const directionOffset = this.directionOffset(keysPressed)
      
      // calculate towards camera direction
      let angleYCameraDirection = 0;
      if (this.target) {
        angleYCameraDirection = Math.atan2(
          (this.target.position.x - this.model.position.x),
          (this.target.position.z - this.model.position.z)
        )
      } else {
        angleYCameraDirection = Math.atan2(
          (this.cameraManager.camera.position.x - this.model.position.x),
          (this.cameraManager.camera.position.z - this.model.position.z)
        )
      }

      // rotate model
      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + directionOffset
      )
      
      this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.1)
      
      // Rotate the ship vertically to reflect vertical movement
      // console.log('walkY', this.model.rotation.x)
      
      // This works, but it keeps spinning
      // this.model.rotateOnAxis(new THREE.Vector3(1,0,0), this.walkDirection.y)
      // const rotateQuarternion2 = new THREE.Quaternion()

      // calculate direction
      if (!this.target) {
        this.cameraManager.camera.getWorldDirection(this.walkDirection)
        this.walkDirection.normalize()
        this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
      }


      let maxVelocity = this.walkVelocity; 
      if (this.currentAction === 'Run') {
        maxVelocity = this.runVelocity;
      } else if (this.currentAction === 'Hyper') {
        maxVelocity = this.HyperVelocity;

        // if (this.target) {
        //   if (this.acceleration > distance) {
        //     this.acceleration -= this.acceleration - distance;
        //   }
        // }

      }
      if (this.acceleration < maxVelocity) {
        this.acceleration += maxVelocity * 0.01
      }
    } else {
      if (this.acceleration > 0) {
        this.acceleration -= this.stop ? this.acceleration * 0.1 : this.acceleration * 0.001
      } else if (this.acceleration < 0) {
        this.acceleration = 0;
      }
    }
    // move model & camera
    const moveX = this.walkDirection.x * this.acceleration * delta
    const moveZ = this.walkDirection.z * this.acceleration * delta
    const moveY = this.walkDirection.y * this.acceleration * delta

    this.model.position.x += moveX
    this.model.position.z += moveZ
    this.model.position.y += moveY

    this.updateCameraTarget(moveX, moveZ, moveY);

    
  }

  private getsKeysForTarget(target: THREE.Vector3) {

    let keys = {
      w: false,
      a: false,
      s: false,
      d: false
    };
    
    let dx = target.x - this.model.position.x;
    let dy = target.y - this.model.position.y;
    let dz = target.z - this.model.position.z;
    
    const margin = 0.1;

    if (dz > margin) {
      keys.w = true;
      this.walkDirection.setZ(1);
    } else if (dz < -margin) {
      keys.s = true;
      this.walkDirection.setZ(-1);
    } else {
      this.walkDirection.setZ(0);
    }

    if (dx > margin) {
      keys.a = true;
      this.walkDirection.setX(1);
    } else if (dx < -margin) {
      keys.d = true
      this.walkDirection.setX(-1);
    } else {
      this.walkDirection.setX(0);
    }

    if (dy > margin) {
      this.walkDirection.setY(1);
    } else if (dy < -margin) {
      this.walkDirection.setY(-1);
    } else {
      this.walkDirection.setY(0);
    }

    return keys
  }

  public updateCameraTarget(moveX: number, moveZ: number, moveY: number) {
    if (!this.cameraManager?.controls) return;
    // move camera
    this.cameraManager.camera.position.x += moveX
    this.cameraManager.camera.position.z += moveZ
    this.cameraManager.camera.position.y += moveY
    // update camera target
    
    this.cameraTarget.x = this.model.position.x
    this.cameraTarget.z = this.model.position.z
    this.cameraTarget.y = this.model.position.y + .001

    this.cameraManager.controls.target = this.cameraTarget
    this.cameraManager?.controls.update();
  }

  private directionOffset(keysPressed: any) {
    var directionOffset = 0 // w
    if (keysPressed[W]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 // w+a
      } else if (keysPressed[D]) {
        directionOffset = - Math.PI / 4 // w+d
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
      } else {
        directionOffset = Math.PI // s
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2 // a
    } else if (keysPressed[D]) {
      directionOffset = - Math.PI / 2 // d
    }

    return directionOffset
  }

  public setTarget(target: Planet) {
    this.target = target;
  }

  public removeTarget() {
    this.target = undefined;
  }

}