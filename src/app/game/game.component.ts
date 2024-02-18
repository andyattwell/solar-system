import { AfterViewInit, Component, ElementRef, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PlanetsJson from "../../assets/planets.json"
import { IOController } from "./IOController";
import { Planet } from "./Planet";
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActionNavComponent } from './action-nav/action-nav.component';
import { PlanetDialogComponent } from './planet-dialog/planet-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Player } from './Player';
import { get2dPosition } from '../../helpers'
import { CharacterControls } from './CharacterControl';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatSidenavModule, SidebarComponent, ActionNavComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent implements AfterViewInit {
  
  // Scene properties
  @Input() public cameraZ: number = 0;
  @Input() public cameraY: number = 10000;
  @Input() public cameraX: number = 0;

  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 10;
  @Input('farClipping') public farClippingPlane: number = 80000;
  @ViewChild('canvas')
  private canvasRef!: ElementRef;
  public get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  public camera!: THREE.PerspectiveCamera;
  public freeCamera!: THREE.PerspectiveCamera;
  public activeCamera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public planets: Array<Planet> = [];
  public timeScale: number = 1;
  public isPlaying: boolean = false;
  public controls!: OrbitControls;
  private Controller: IOController = new IOController(this);
  private selectedPlanet!: Planet;
  private player:Player|null = null;
  private clock:THREE.Clock = new THREE.Clock();

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) {
    this.createPlanets();
  }

  ngAfterViewInit(): void {


    this.createScene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });

    
    this.activeCamera = this.camera
    
    // this.createControls();
    this.changeCamera('system');

    this.setAspectRatio();

    // this.crateSkyBox();

    this.addPlanetsToScene();

    // this.lookAtPlanet(this.planets[3]);
    
    this.player = new Player(this)
    this.scene.add( this.player.mesh );
    this.changeCamera('player');


    this.playGame();

    this.cdRef.detectChanges(); 
  }

  private createSystemCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.canvas.clientWidth / this.canvas.clientHeight,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.name = 'system'
  }

  private createFreeCamera() {
    this.freeCamera = new THREE.PerspectiveCamera(
      50,
      this.canvas.clientWidth / this.canvas.clientHeight,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.freeCamera.name = 'free'
  }
  /**
   * Create the scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
  }

  private createControls() {
    if (!this.controls) {
      this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
    }
    // this.controls.object = camera;
    // this.controls.enableZoom = true;
    // this.controls.enableRotate = false;
    // this.controls.zoomToCursor = true;
    // this.controls.target = new THREE.Vector3(this.cameraX, this.cameraY, 0);

    // const pX = this.planets[this.planets.length-1].planet.position.x
    // var minPan = new THREE.Vector3( -pX, -10, 0);
    // var maxPan = new THREE.Vector3( pX, 10, 0);
    // var _v = new THREE.Vector3();
    
    // const self = this;
    // this.controls.addEventListener("change", function() {
    //     _v.copy(self.controls.target);
    //     self.controls.target.clamp(minPan, maxPan);
    //     _v.sub(self.controls.target);
    //     self.camera.position.sub(_v);
    // })
    
    // this.controls.update();
  }

  private crateSkyBox(): void {
    const skyTexture = new THREE.TextureLoader().load("/assets/big-skybox-back.png");
    skyTexture.wrapS = THREE.MirroredRepeatWrapping;
    skyTexture.wrapT = THREE.MirroredRepeatWrapping;
    skyTexture.repeat.set(64, 64);

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture, side: THREE.BackSide,
    });
    const materialArray: Array<THREE.MeshBasicMaterial> = [
      skyMat,
      skyMat,
      skyMat,
      skyMat,
      skyMat,
      skyMat
    ]
    const boxSize = 5000;
    let skyboxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    skybox.name = "skybox";
    this.scene.add(skybox);
  }

  private setAspectRatio(): void {
    const height = this.canvas.parentElement?.clientHeight || 1;
    const width = this.canvas.parentElement?.clientWidth || 1;
    this.activeCamera.aspect = width / height;
    this.activeCamera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  /**
   * Animate Scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private animateScene() {
    this.planets.forEach(planet => {
      planet.animate(this.planets[0], this.timeScale);
    });
    this.player?.animate(this.clock.getDelta());
    // if (this.selectedPlanet) {
    //   this.lookAtPlanet()
    // }
    this.controls.update()
  }

  private createPlanets() {
    const self = this;
    PlanetsJson.forEach(props => {
      try {
        let planet = new Planet(props);
        self.planets.push(planet);
      } catch (error) {
        console.log({ error, props })
      }
    });
    
  }

  private addPlanetsToScene() {
    const self = this;
    self.planets.forEach(planet => {
      self.scene.add(planet);
    });
  }

  /**
   * Start the rendering loop
   * 
   * @private
   * @memberof CubeComponent
   */
  private startRenderingLoop() {
    let component: GameComponent = this;
    (function render() {
      if (!component.isPlaying) {
        return;
      }
      requestAnimationFrame(render);
      component.animateScene();
      component.renderer.render(component.scene, component.activeCamera);
    }())
  }

  public selectPlanet(planet: Planet, show: boolean = false): void {
    this.selectedPlanet = planet;
    if (this.selectedPlanet && show) {
      this.lookAtPlanet(this.selectedPlanet);
      this.openDialog(this.selectedPlanet.planet);
    }
  }

  public openDialog(planet: THREE.Mesh) {

    const dialogId = 'planet-info';
    const _dialog = this.dialog.getDialogById(dialogId)
    console.log(_dialog)
    if (_dialog) {
      _dialog.componentInstance.data = planet.parent;
      return
    }

    const dialogRef = this.dialog.open(PlanetDialogComponent, {
      height: '400px',
      width: '400px',
      data: planet.parent,
      hasBackdrop: false,
      disableClose: true,
      id: dialogId,
      position: {
        left: '300px', 
        top: '50px',
        // left: pos.x.toFixed(0) + 'px', 
        // top: pos.y.toFixed(0) + 'px',
      }
    });

    dialogRef.componentInstance.onClose.subscribe(() => {
      dialogRef.close();
    });

    // dialogRef.afterClosed().subscribe(result => {});

  }

  private lookAtPlanet(planet: Planet): void {
    const planetPos = planet.planet.position;
    this.cameraX = planetPos.x + (planet.size * 200)
    this.cameraY = planetPos.y + 45
    this.cameraZ = planetPos.z + (planet.size * 200)

    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
    this.camera.lookAt(planetPos.x, planetPos.y, planetPos.z);

    // this.controls.target = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z);
    // this.controls.update();
  }

  public pauseGame() {
    this.isPlaying = false;
  }

  public playGame() {
    this.isPlaying = true;
    this.timeScale = 1;
    this.startRenderingLoop();
  }

  public changeSpeed(speed: number) {
    this.timeScale = speed;
    if (speed === 0) {
      this.pauseGame();
    } else {
      this.playGame();
      this.timeScale = speed;
    }
  }

  private setFreeCamera() {
    
    if (!this.freeCamera) {
      this.createFreeCamera();
    }

    const prevCamX = this.activeCamera.position.x
    const prevCamY = this.activeCamera.position.y
    const prevCamZ = this.activeCamera.position.z - 20

    const prevTarget = this.controls.target;

    console.log('setFreeCamera', this.activeCamera)
    this.controls?.dispose();
    
    this.activeCamera = this.freeCamera;
    this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
    this.controls.enableZoom = true;
    this.controls.zoomToCursor = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    // this.activeCamera.position.set(500, 0, 300);
    this.activeCamera.position.set(prevCamX, prevCamY, prevCamZ);
    this.controls.target = prevTarget;
    // this.camera.lookAt(0, 0, 0);
  }

  private setSystemCamera() {

    if (!this.camera) {
      this.createSystemCamera();
    }
    
    this.controls?.dispose();
    
    this.activeCamera = this.camera;
    this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);
    this.camera.lookAt(0, 0, 0);
  }

  setPlayerCamera() {

    if (!this.player) return;

    this.controls.dispose();

    this.activeCamera = this.player.camera;
    this.activeCamera.position.set(this.player.mesh.position.x, this.player.mesh.position.y, this.player.mesh.position.z-0.2)
    
    this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
    this.controls.enableDamping = true
    this.controls.minDistance = 0.01
    this.controls.maxDistance = 0.1
    this.controls.enablePan = false;
    // this.controls.maxPolarAngle = Math.PI / 2 - 0.05
    this.controls.target = this.player.mesh.position;
    this.controls.update();
  }

  public changeCamera(cameraType: string) {
    if (cameraType === 'system') {
      this.setSystemCamera();
    } else if (cameraType === 'player') {
      this.setPlayerCamera();
    } else if (cameraType === 'free') {
      this.setFreeCamera();
    }
    // this.createControls(this.activeCamera);
  }

}
