import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Planet } from './Planet';
import { GameComponent } from '../app/game/game.component';

export class CameraManager {
  private parent:GameComponent;
  public camera:THREE.PerspectiveCamera = new PerspectiveCamera();
  public controls?:OrbitControls;

  constructor(parent: GameComponent) {
    this.parent = parent;
  }

  public setFreeCamera() {

    this.camera = new PerspectiveCamera();
    this.camera.name = 'free'
    this.camera.aspect = this.parent.canvas.clientWidth / this.parent.canvas.clientHeight
    this.camera.near = 0.01;
    this.camera.far = 8000;
    this.camera.fov = 45;
    this.camera.position.set(0, 100, 0);

    this.controls?.dispose();
    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.zoomToCursor = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.maxDistance = 1700;
    this.controls.minDistance = 0.1;
    this.controls.target = new Vector3(0, 0, 0);
  }

  public setSystemCamera() {

    this.camera = new PerspectiveCamera();
    this.camera.name = 'system'
    this.camera.aspect = this.parent.canvas.clientWidth / this.parent.canvas.clientHeight
    this.camera.near = 0.1;
    this.camera.far = 8000;
    this.camera.fov = 10;
    
    this.controls?.dispose();
    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.maxDistance = 170;
    this.controls.minDistance = 0.1;
    this.controls.enableRotate = false;
    this.controls.target = new Vector3(0, 0, 0);
    this.camera.position.set(0, 1000, 0);
    this.camera.lookAt(0, 0, 0);

    this.parent.starSystem.showOrbit = false;
    this.parent.toggleShowOrbit();
  }

  public setPlayerCamera() {

    if (!this.parent.player) return;

    this.camera = new PerspectiveCamera();
    this.camera.name = 'player'
    this.camera.aspect = this.parent.canvas.clientWidth / this.parent.canvas.clientHeight
    this.camera.near = 0.001;
    this.camera.far = 8000;
    this.camera.fov = 45;

    this.controls?.dispose();
    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableDamping = true
    this.controls.minDistance = 0.005
    this.controls.maxDistance = 0.01
    this.controls.enablePan = false;
    this.controls.target = this.parent.player.mesh.position;
    this.controls.update();

    this.parent.starSystem.showOrbit = true;
    // this.parent.toggleShowOrbit();

  }

  public lookAtPlanet(planet: Planet): void {
    let planetPosX = planet.container.position.x;
    let planetPosY = planet.container.position.y;
    let planetPosZ = planet.container.position.z;

    if (planet.orbitCenter) {
      planetPosX += planet.orbitCenter.position.x;
      planetPosY += planet.orbitCenter.position.y;
      planetPosZ += planet.orbitCenter.position.z;
    }

    if (this.camera.name === 'free') {
      
      this.camera.position.set(
        planetPosX - (planet.size * 3),
        planetPosY + planet.size * 2,
        planetPosZ + (planet.size * 3)
      );
      this.camera.lookAt(planetPosX, planetPosY, planetPosZ);
      if (!this.controls) return;
      this.controls.target = new Vector3(planetPosX, planetPosY, planetPosZ);
      this.controls.update();

    } else if (this.camera.name === 'player') {
      if (!this.parent.player) return;
      let xOffset = -planet.size;
      let zOffset = planet.size * 2;
      if (planet.name === 'Sun') {
        xOffset = planet.size;
        zOffset = 5;
      }
      this.parent.player.mesh.position.set(
        planetPosX + xOffset,
        0,
        planetPosZ + zOffset
      );
      this.parent.player.mesh.rotateY(90)
      this.parent.player?.characterControls?.updateCameraTarget(planetPosX, planetPosZ, 0);
      this.camera.position.set(
        this.parent.player?.mesh.position.x,
        this.parent.player?.mesh.position.y + 0.005,
        this.parent.player?.mesh.position.z + 0.02,
      )
      this.camera.lookAt(planet.container.position)
      if (!this.controls) return;
      this.controls.update();

    } else if (this.camera.name === 'system') {
      // this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
      this.camera.position.setX(planetPosX);
      this.camera.position.setZ(planetPosZ);
      // this.camera.position.setY(planetPos.y + planet.size * 24);
      this.camera.lookAt(planetPosX, planetPosY, planetPosZ);
      if (!this.controls) return;
      this.controls.target = new Vector3(planetPosX, planetPosY, planetPosZ);
      this.controls.update();

    }
  }

  public setAspectRatio(): void {
    const height = this.parent.canvas.parentElement?.clientHeight || 1;
    const width = this.parent.canvas.parentElement?.clientWidth || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.parent.renderer.setSize(width, height);
    this.parent.renderer.setPixelRatio(window.devicePixelRatio);
  }

}