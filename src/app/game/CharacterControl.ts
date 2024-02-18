import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { A, D, DIRECTIONS, S, W, E, Q } from '../../helpers'
import { Player } from './Player'

export class CharacterControls {

    model: THREE.Mesh
    orbitControl: OrbitControls|undefined
    camera: THREE.PerspectiveCamera

    // state
    toggleRun: boolean = true
    currentAction: string
    
    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion: THREE.Quaternion = new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    
    // constants
    fadeDuration: number = 0.2
    runVelocity = 5
    walkVelocity = 2

    constructor(
        model: THREE.Mesh,
        orbitControl: OrbitControls|undefined,
        camera: THREE.PerspectiveCamera,
        currentAction: string) {
        this.model = model
        this.currentAction = currentAction
        this.orbitControl = orbitControl
        this.camera = camera
        
        // this.updateCameraTarget(this.model.position.x, this.model.position.z + 0.1)
    }

    public switchRunToggle() {
        this.toggleRun = !this.toggleRun
    }

    public update(delta: number, keysPressed: any) {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

        if (directionPressed && this.toggleRun) {
          this.currentAction = 'Run'
        } else if (directionPressed) {
          this.currentAction = 'Walk'
        } else {
          this.currentAction = 'Idle'
        }

        if (this.currentAction == 'Run' || this.currentAction == 'Walk') {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed)
            
            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            // this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // run/walk velocity
            const velocity = this.currentAction == 'Run' ? this.runVelocity : this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta
            this.model.position.x += moveX
            this.model.position.z += moveZ
            // if (keysPressed[E]) {
            //   this.model.position.y += 0.01
            // } else if (keysPressed[Q]) {
            //   this.model.position.y -= 0.01
            // }
            this.updateCameraTarget(moveX, moveZ, 0.01)
        }
    }

    public updateCameraTarget(moveX: number, moveZ: number, moveY:number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ
        // this.camera.position.y += moveY
        this.camera.position.y = 0.03
        // update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y
        this.cameraTarget.z = this.model.position.z
        if (!this.orbitControl) return;
        this.orbitControl.target = this.cameraTarget
        this.orbitControl.update();
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