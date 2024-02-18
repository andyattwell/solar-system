import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import PlanetsJson from "../../assets/data/planets.json"
import { IOController } from "./IOController";
import { Planet } from "./Planet";
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActionNavComponent } from './action-nav/action-nav.component';
import { PlanetDialogComponent } from './planet-dialog/planet-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Player } from './Player';
import { CameraManager } from './CameraManager';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatSidenavModule, SidebarComponent, ActionNavComponent],
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

  private Controller: IOController = new IOController(this);
  private selectedPlanet!: Planet;
  public player:Player|null = null;
  private clock:THREE.Clock = new THREE.Clock();

  public showOrbit: boolean = false;
  public followOrbit: boolean = false;
  public rotationEnabled: boolean = true;

  public cameraManager: CameraManager = new CameraManager(this);
  
  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) {
    this.createPlanets();
  }
  
  ngAfterViewInit(): void {
    this.createScene();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });

    this.cameraManager = new CameraManager(this)
    
    // this.crateSkyBox();
    
    this.addPlanetsToScene();
    
    this.player = new Player(this)
    this.scene.add( this.player.mesh );

    this.setCamera('player');

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
  public toggleShowOrbit(show:boolean): void {
    this.showOrbit = show;
    this.planets.forEach(p => {
      p.toggleShowOrbit(show);
    });
  }

  public toggleFollowOrbit(follow:boolean): void {
    this.followOrbit = follow;
    this.planets.forEach(p => {
      p.followOrbit = follow
    })
  }

  public toggleRotation(rotate:boolean): void {
    this.rotationEnabled = rotate
    this.planets.forEach(p => {
      p.rotate = rotate
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
