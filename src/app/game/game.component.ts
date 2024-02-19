import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import * as THREE from 'three';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ActionNavComponent } from './action-nav/action-nav.component';
import { PlanetDialogComponent } from './planet-dialog/planet-dialog.component';
import { LoaderComponent } from './loader/loader.component';

import { Planet } from "./Planet";
import { Player } from './Player';
import { IOController } from "./IOController";
import { CameraManager } from './CameraManager';

import PlanetsJson from "../../assets/data/planets.json"
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatSidenavModule, 
    SidebarComponent, 
    ActionNavComponent,
    LoaderComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent implements AfterViewInit {

  @ViewChild('canvas')
  private canvasRef!: ElementRef;
  public get canvas(): HTMLCanvasElement {
    return this.canvasRef?.nativeElement;
  }

  public camera!: THREE.PerspectiveCamera;
  public freeCamera!: THREE.PerspectiveCamera;
  public activeCamera!: THREE.PerspectiveCamera;
  public selectedCamera: string = '';
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public planets: Array<Planet> = [];
  public timeScale: number = 1;
  public isPlaying: boolean = false;
  public isLoading: boolean = true;

  private Controller: IOController = new IOController(this);
  private selectedPlanet!: Planet;
  public player:Player|null = null;
  private clock:THREE.Clock = new THREE.Clock();

  public showOrbit: boolean = false;
  public followOrbit: boolean = false;
  public rotationEnabled: boolean = true;

  public cameraManager: CameraManager = new CameraManager(this);
  
  private skybox: THREE.Mesh = new THREE.Mesh;
  
  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) {
    this.createPlanets();
  }
  
  ngAfterViewInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.newGame();
    }, 500)
    this.cdRef.detectChanges(); 
  }

  /**
   * Create the scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private newGame() {
    this.createScene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.cameraManager = new CameraManager(this);
    
    this.crateSkyBox();
    this.addPlanetsToScene();
    
    this.player = new Player(this)

    this.setCamera('player');
    this.player.init();
    
    const self = this;
    this.cameraManager.lookAtPlanet(this.planets[3]);
    this.playGame();
    setTimeout(() => {
      self.isLoading = false;
    },1000)
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


  private crateSkyBox(): void {
    const skyTexture = new THREE.TextureLoader().load("/assets/textures/milky-way.jpg");
    const material = new THREE.MeshPhongMaterial({ 
      map: skyTexture,
      side: THREE.BackSide
    });
    const skyGeo = new THREE.SphereGeometry(600, 25, 25); 
    this.skybox = new THREE.Mesh(skyGeo, material);
    this.skybox.name = "skybox";
    this.scene.add(this.skybox);
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
    this.camera?.layers.set(0);
    if (!this.cameraManager.controls) return;
    this.cameraManager.controls.update()
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
      planet.layers.set(2);
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

  public selectPlanet(planet?: Planet, show?: boolean): void {

    if (!planet) {
      return this.setCamera('system');
    }

    this.selectedPlanet = planet;
    if (this.selectedPlanet && show) {
      this.cameraManager.lookAtPlanet(this.selectedPlanet);
      this.openDialog(this.selectedPlanet.planet);
    }
  }

  public openDialog(planet: THREE.Mesh) {

    const dialogId = 'planet-info';
    const _dialog = this.dialog.getDialogById(dialogId)
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
  public toggleShowOrbit(showOrbit?:boolean): void {
    this.showOrbit = showOrbit ? showOrbit : !this.showOrbit;
    this.planets.forEach(p => {
      p.toggleShowOrbit(this.showOrbit);
    });
  }

  public toggleFollowOrbit(): void {
    this.followOrbit = !this.followOrbit;
    this.planets.forEach(p => {
      p.followOrbit = this.followOrbit
    })
  }

  public toggleRotation(): void {
    this.rotationEnabled = !this.rotationEnabled;
    this.planets.forEach(p => {
      p.rotate = this.rotationEnabled
    })
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


  public setCamera(cameraType: string) {
    if (cameraType === 'system') {
      this.cameraManager.setSystemCamera();
    } else if (cameraType === 'player') {
      this.cameraManager.setPlayerCamera();
    } else if (cameraType === 'free') {
      this.cameraManager.setFreeCamera();
    }
    this.activeCamera = this.cameraManager.camera;
    this.selectedCamera = this.cameraManager.camera.name;
    this.cameraManager.setAspectRatio();
  }

}
