import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import * as THREE from 'three';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ActionNavComponent } from './action-nav/action-nav.component';
import { PlanetDialogComponent } from './planet-dialog/planet-dialog.component';
import { LoaderComponent } from './loader/loader.component';

import { Planet } from "../../classes/Planet";
import { Player } from '../../classes/Player';
import { IOController } from "../../classes/IOController";
import { CameraManager } from '../../classes/CameraManager';

import SystemData from "../../assets/data/planets.json";
import { System } from '../../classes/StarSystem';
import { PlanetSelectorComponent } from './planet-selector/planet-selector.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatSidenavModule, 
    SidebarComponent, 
    PlanetSelectorComponent,
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
  public showSidebar = false;

  public freeCamera!: THREE.PerspectiveCamera;
  public activeCamera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  

  public timeScale: number = 1;
  public isPlaying: boolean = false;
  public isLoading: boolean = true;

  private Controller: IOController;
  public selectedPlanet!: Planet;
  public player:Player|null = null;
  private clock:THREE.Clock = new THREE.Clock();

  public starSystem = new System(SystemData);
  // public planets: Array<Planet> = [];

  public followOrbit: boolean = false;
  public rotationEnabled: boolean = true;

  public cameraManager: CameraManager = new CameraManager(this);
  
  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) {
    this.Controller = new IOController(this);
  }

  public get planets () {
    return [this.starSystem.star].concat(this.starSystem.planets);
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
      antialias: true,
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.cameraManager = new CameraManager(this);
    
    this.starSystem.startScene(this.scene);
    
    this.player = new Player(this)

    this.setCamera('player');
    this.player.init();
    
    this.selectPlanet(this.planets[3], true);
    
    const self = this;
    setTimeout(() => {
      self.playGame();
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

  /**
   * Animate Scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private animateScene() {
    this.starSystem.planets.forEach(planet => {
      planet.animate(this.timeScale);
    });
    this.player?.animate(this.clock.getDelta(), this.Controller.keysPressed);
    
    if (this.cameraManager.camera.name === 'system' && this.selectedPlanet) {
      this.cameraManager.lookAtPlanet(this.selectedPlanet)
    }

    if (!this.cameraManager.controls) return;
    this.cameraManager.controls.update()
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
      // this.openDialog(this.selectedPlanet);
      this.openPlanetInfo()
    }
  }

  public openPlanetInfo() {
    this.showSidebar = true;
    setTimeout(() => {
      this.cameraManager.setAspectRatio();
    }, 1)
  }

  public closePlanetInfo() {
    this.showSidebar = false;
    setTimeout(() => {
      this.cameraManager.setAspectRatio();
    }, 1)
  }

  public openDialog(planet: Planet) {

    const dialogId = 'planet-info';
    const _dialog = this.dialog.getDialogById(dialogId)
    if (_dialog) {
      _dialog.componentInstance.data = planet;
      return
    }

    const dialogRef = this.dialog.open(PlanetDialogComponent, {
      height: '400px',
      width: '400px',
      data: planet,
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

  public toggleShowOrbit(showOrbit:boolean): void {
    this.starSystem.toggleShowOrbit(showOrbit)
  }

  public toggleFollowOrbit(): void {
    this.starSystem.toggleFollowOrbit();
  }

  public toggleRotation(): void {
    this.starSystem.toggleRotation();
  }

  public pauseGame() {
    this.isPlaying = false;
  }

  public playGame() {
    this.isLoading = false;
    this.isPlaying = true;
    this.timeScale = 1;
    this.startRenderingLoop();
  }

  public changeSpeed(speed: number) {
    this.timeScale = speed;
    // if (speed === 0) {
    //   this.pauseGame();
    // } else {
    //   this.playGame();
    // }
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
    setTimeout(() => {
      this.cameraManager.setAspectRatio();
    }, 1)
  }

}
