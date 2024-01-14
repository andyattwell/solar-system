import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PlanetsJson from "../../assets/planets.json"
import { IOController } from "./IOController";
import { Planet } from "./Planet";
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatSidenavModule, SidebarComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent implements AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;
  
  // Scene properties
  @Input() public cameraZ: number = 5000;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 80000;

  public camera!: THREE.PerspectiveCamera;

  public get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene; 
  public planets:Array<Planet> = [];

  private controls!: OrbitControls;

  private Controller: IOController = new IOController(this);

  private selectedPlanet!: Planet;
  /**
   * Create the scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.renderer.setPixelRatio(this.getAspectRatio())
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // this.setAspectRatio();

    let aspectRatio = this.getAspectRatio();

    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    

    this.createControls();
    

    const light = new THREE.AmbientLight(0x404040);
    light.intensity = 10;
    this.scene.add(light);
  }

  createControls() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.maxDistance = 40000;
    // this.controls.minDistance = 50;
    // this.controls.enabled = true;
    this.controls.enableZoom = false;
    // this.controls.enablePan = true;
    // this.controls.enableDamping = true;
    // this.controls.zoomSpeed = 0.001;
    // this.controls.zoomToCursor = true;
    this.camera.position.set(0,0,this.cameraZ);
    this.controls.update();
  }

  private crateSkyBox():void {
    const skyTexture = new THREE.TextureLoader().load("/assets/big-skybox-back.png");
    skyTexture.wrapS = THREE.MirroredRepeatWrapping;
    skyTexture.wrapT = THREE.MirroredRepeatWrapping;
    skyTexture.repeat.set( 64, 64 );

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture, side: THREE.BackSide,
    });
    const materialArray:Array<THREE.MeshBasicMaterial> = [
      skyMat,
      skyMat,
      skyMat,
      skyMat,
      skyMat,
      skyMat
    ]
    const boxSize = 50000;
    let skyboxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    skybox.name = "skybox";
    this.scene.add(skybox);
  }

  private setAspectRatio(): void {
    this.renderer.setPixelRatio(this.getAspectRatio())
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /**
   * Returns current aspect ratio
   * 
   * @private
   * @memberof CubeComponent
   */
  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  /**
   * Animate cube
   * 
   * @private
   * @memberof CubeComponent
   */
  private animateScene() {
    this.planets.forEach(planet => {
      planet.animate(this.planets[0]);
    });
    // if (this.selectedPlanet) {
    //   this.followPlanet()
    // }
    this.controls.update()
  }

  private createPlanets() {
    // let planets:Array<PlanetProps> = PlanetsJson;

    const self = this;

    PlanetsJson.forEach(props => {
      try {
        let planet = new Planet(props);
        self.planets.push(planet);
        self.scene.add(planet);
      } catch (error) {
        console.log({error, props})
      }
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
    (function render(){
      requestAnimationFrame(render);
      component.animateScene();
      component.renderer.render(component.scene, component.camera);
    }())
  }

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.createScene();
    this.crateSkyBox();
    this.createPlanets();
    this.startRenderingLoop();
  }

  public selectPlanet(planet:Planet):void {
    this.selectedPlanet = planet;
    this.followPlanet();
  }
  
  private followPlanet(): void {
    const offset = this.selectedPlanet.size / 2;
    // const posX = this.selectedPlanet.position.x + this.selectedPlanet.size / 2 - offset;
    const planetPos = this.selectedPlanet.planet.position;
    // const posX = planetPos.x + this.selectedPlanet.size / 2 + offset;
    // const posY = planetPos.y - this.selectedPlanet.size;
    // const posZ = planetPos.z - this.selectedPlanet.size;

    // this.camera.position.set(posX, posY, posZ);
    this.camera.lookAt(planetPos.x, planetPos.y, planetPos.z);
    this.controls.target = new THREE.Vector3(planetPos.x, planetPos.y, planetPos.z);
    // this.camera.position.z = planetPos.z - this.selectedPlanet.size * 2;
    // this.camera.position.x = planetPos.x - this.selectedPlanet.size * 2;

    this.controls.update();
  }

}
