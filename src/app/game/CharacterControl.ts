import * as THREE from 'three'
import { A, D, DIRECTIONS, S, W } from '../../helpers'
import { CameraManager } from './CameraManager'

export class CharacterControls {

  model: THREE.Mesh
  cameraManager?: CameraManager

  // state
  toggleRun: boolean = false
  toggleHyper: boolean = false;
  currentAction: string

  // temporary data
  walkDirection = new THREE.Vector3()
  rotateAngle = new THREE.Vector3(0, 1, 0)
  rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
  cameraTarget = new THREE.Vector3()

  // constants
  fadeDuration: number = 0.2
  runVelocity = 1
  HyperVelocity = 10
  walkVelocity = 0.05

  constructor(
    model: THREE.Mesh,
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

  public rotateModel(target: any, directionOffset: number = Math.PI / 4) {
    // calculate towards camera direction
    var angleYCameraDirection = Math.atan2(
      (target.position.x - this.model.position.x),
      (target.position.z - this.model.position.z)
    )

    // rotate model
    this.rotateQuarternion.setFromAxisAngle(
      this.rotateAngle,
      angleYCameraDirection + directionOffset
    )
    this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.1)
  }

  public update(delta: number, keysPressed: any) {
    if (!this.cameraManager) return;
    const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

    if (directionPressed && this.toggleRun) {
      this.currentAction = 'Run'
    } else if (directionPressed && this.toggleHyper) {
      this.currentAction = 'Hyper'
    } else if (directionPressed) {
      this.currentAction = 'Walk'
    } else {
      this.currentAction = 'Idle'
    }

    if (this.currentAction == 'Run' || this.currentAction == 'Hyper' || this.currentAction == 'Walk') {
      // diagonal movement angle offset
      var directionOffset = this.directionOffset(keysPressed)
      this.rotateModel(this.cameraManager.camera, directionOffset);

      // calculate direction
      this.cameraManager.camera.getWorldDirection(this.walkDirection)
      // this.walkDirection.y = 0
      this.walkDirection.normalize()
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

      // run/walk velocity
      let velocity = this.walkVelocity;
      if (this.currentAction === 'Run') {
        velocity = this.runVelocity;
      } else if (this.currentAction === 'Hyper') {
        velocity = this.HyperVelocity;
      }

      // move model & camera
      const moveX = this.walkDirection.x * velocity * delta
      const moveZ = this.walkDirection.z * velocity * delta
      this.model.position.x += moveX
      this.model.position.z += moveZ
      this.updateCameraTarget(moveX, moveZ, 0.01);
    }
  }

  public updateCameraTarget(moveX: number, moveZ: number, moveY: number) {
    if (!this.cameraManager?.controls) return;
    // move camera
    this.cameraManager.camera.position.x += moveX
    this.cameraManager.camera.position.z += moveZ
    // update camera target
    this.cameraTarget.x = this.model.position.x
    this.cameraTarget.z = this.model.position.z

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
}