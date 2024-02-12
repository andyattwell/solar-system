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

import { get2dPosition } from '../../helpers'

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatSidenavModule, SidebarComponent, ActionNavComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent implements AfterViewInit {
  
  // Scene properties
  @Input() public cameraZ: number = 2000;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 80000;
  @ViewChild('canvas')
  private canvasRef!: ElementRef;
  public get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  public camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  public planets: Array<Planet> = [];
  public timeScale: number = 1;
  public play: boolean = false;
  private controls!: OrbitControls;
  private Controller: IOController = new IOController(this);
  private selectedPlanet!: Planet;

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.createPlanets();
    this.createScene();
    this.crateSkyBox();
    this.addPlanetsToScene();
    this.lookAtPlanet(this.planets[1]);
    this.playGame();
    this.cdRef.detectChanges(); 
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

    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.canvas.clientWidth / this.canvas.clientHeight,
      this.nearClippingPlane,
      this.farClippingPlane
    )

    this.camera.position.set(this.planets[0].position.x, 100, this.cameraZ);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.setAspectRatio();
    this.createControls();

    const light = new THREE.AmbientLight(0x404040);
    light.intensity = 10;
    this.scene.add(light);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    // this.controls.enableRotate = false;
    this.controls.zoomToCursor = true;

    const pX = this.planets[this.planets.length-1].planet.position.x
    var minPan = new THREE.Vector3( -pX, -10, 0);
    var maxPan = new THREE.Vector3( pX, 10, 0);
    var _v = new THREE.Vector3();
    
    const self = this;
    this.controls.addEventListener("change", function() {
        _v.copy(self.controls.target);
        self.controls.target.clamp(minPan, maxPan);
        _v.sub(self.controls.target);
        self.camera.position.sub(_v);
    })
    
    this.controls.update();
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
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height)
  }

  /**
   * Animate cube
   * 
   * @private
   * @memberof CubeComponent
   */
  private animateScene() {
    this.planets.forEach(planet => {
      planet.animate(this.planets[0], this.timeScale);
    });
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
      if (!component.play) {
        return;
      }
      requestAnimationFrame(render);
      component.animateScene();
      component.renderer.render(component.scene, component.camera);
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
    
    if (!planet.parent || this.dialog.getDialogById(planet.parent.name)) {
      return
    }

    // const width = this.canvas.parentElement?.clientWidth || 1;
    // const height = this.canvas.parentElement?.clientHeight || 1;

    // const pos = get2dPosition(
    //   planet,
    //   this.camera,
    //   width,
    //   height
    // )

    // if (pos.x >= width) {
    //   pos.x = width - 100;
    // }

    const dialogRef = this.dialog.open(PlanetDialogComponent, {
      height: '400px',
      width: '400px',
      data: planet.parent,
      hasBackdrop: false,
      disableClose: true,
      id: planet.parent.name, 
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
    this.camera.lookAt(planetPos.x, planetPos.y, planetPos.z);
    this.camera.position.set(0, 0, 1000)
    this.controls.target = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z);
    this.controls.update();
  }

  public pauseGame() {
    this.play = false;
  }

  public playGame() {
    this.play = true;
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

}
