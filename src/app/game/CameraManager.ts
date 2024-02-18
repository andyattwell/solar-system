import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Player } from './Player';
import { Planet } from './Planet';
import { GameComponent } from './game.component';

export class CameraManager {
  private parent:GameComponent;
  public camera:THREE.PerspectiveCamera = new PerspectiveCamera();
  public controls?:OrbitControls;

  constructor(
    parent: GameComponent
  ) {
    this.parent = parent;
  }

  public setFreeCamera() {

    this.camera = new PerspectiveCamera();
    this.camera.name = 'free'
    this.camera.aspect = this.parent.canvas.clientWidth / this.parent.canvas.clientHeight
    this.camera.near = 1;
    this.camera.far = 8000;
    this.camera.fov = 45;

    this.controls?.dispose();
    
    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.zoomToCursor = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.maxDistance = 100000;
    this.controls.minDistance = 0;
    this.controls.target = new Vector3(0, 0, 0);

    this.camera.position.set(0, 100, 0);
    // this.activeCamera.lookAt(0, 0, 0);
  }

  public setSystemCamera() {

    this.camera = new PerspectiveCamera();
    this.camera.name = 'system'
    this.camera.aspect = this.parent.canvas.clientWidth / this.parent.canvas.clientHeight
    this.camera.near = 1;
    this.camera.far = 80000;
    this.camera.fov = 10;
    
    this.controls?.dispose();
    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.maxDistance = 10000;
    this.controls.minDistance = 10;

    this.controls.enableRotate = false;
    this.controls.target = new Vector3(0, 0, 0);
    this.camera.position.set(0, 1000, 0);
    this.camera.lookAt(0, 0, 0);

    this.parent.toggleShowOrbit(true);
  }

  public setPlayerCamera() {
    this.parent.toggleShowOrbit(false);

    if (!this.parent.player) return;

    this.controls?.dispose();

    this.camera = this.parent.player.camera;
    // this.camera.position.set(this.player.mesh.position.x, this.player.mesh.position.y, this.player.mesh.position.z-0.2)
    this.camera.name = 'player';

    this.controls = new OrbitControls(this.camera, this.parent.renderer.domElement);
    this.controls.enableDamping = true
    this.controls.minDistance = 0.01
    this.controls.maxDistance = 0.1
    this.controls.enablePan = false;
    // this.controls.maxPolarAngle = Math.PI / 2 - 0.05
    this.controls.target = this.parent.player.mesh.position;
    this.controls.update();

    // this.toggleShowOrbit(false);

  }

  public lookAtPlanet(planet: Planet): void {
    const planetPos = planet.planet.position;
    
    if (this.camera.name === 'free') {
      
      this.camera.position.set(
        planetPos.x - (planet.size * 3),
        planetPos.y + planet.size * 2,
        planetPos.z + (planet.size * 3)
      );
      this.camera.lookAt(planetPos.x, planetPos.y, planetPos.z);
      if (!this.controls) return;
      this.controls.target = new Vector3(planetPos.x, planetPos.y, planetPos.z);
      this.controls.update();

    } else if (this.camera.name === 'player') {

      this.parent.player?.mesh.position.set(planetPos.x, planetPos.y, planetPos.z + planet.size * 2);

      var angleYCameraDirection = Math.atan2(
        (this.camera.position.x - planet.position.x), 
        (this.camera.position.z - planet.position.z))

      this.camera.rotateOnAxis( new Vector3( 0, 1, 0 ), angleYCameraDirection );

      // this.activeCamera.lookAt(planetPos.x, planetPos.y, planetPos.z);

      // this.activeCamera.rot
      // this.player.characterControls.cameraTarget
      if (!this.controls) return;
      this.controls.update();

    } else if (this.camera.name === 'system') {
      // this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
      this.camera.position.setX(planetPos.x);
      this.camera.position.setZ(planetPos.z);
      this.camera.position.setY(planetPos.y + planet.size * 24);
      this.camera.lookAt(planetPos.x, planetPos.y, planetPos.z);
      if (!this.controls) return;
      this.controls.target = new Vector3(planetPos.x, planetPos.y, planetPos.z);
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