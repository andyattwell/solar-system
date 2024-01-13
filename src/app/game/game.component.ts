import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Planets from "../../assets/planets.json"
import { IOControler } from "./IOControler";
import { Planet, PlanetProps } from "./Planet";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  // Scene properties
  @Input() public cameraZ: number = 10000;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 80000;

  public camera!: THREE.PerspectiveCamera;

  public get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene; 
  private planets:Array<Planet> = [];

  private controls!: OrbitControls;

  private Controler: IOControler = new IOControler(this);
  /**
   * Create the scene
   * 
   * @private
   * @memberof CubeComponent
   */
  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;

    const light = new THREE.AmbientLight(0x404040);
    light.intensity = 10;
    this.scene.add(light);

    this.createPlanets();
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
    // this.cube.rotation.x += this.rotationSpeedX;
    this.planets.forEach(planet => {
      planet.animate();
    });
  }

  private createPlanets() {
    let planets:Array<PlanetProps> = Planets;

    const self = this;

    planets.forEach(props => {
      let planet = new Planet(props);
      self.planets.push(planet);
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
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.renderer.setPixelRatio(this.getAspectRatio())
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: GameComponent = this;
    (function render(){
      requestAnimationFrame(render);
      component.animateScene();
      component.renderer.render(component.scene, component.camera);
    }())
  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    this.createScene();
    this.startRenderingLoop();
    this.crateSkyBox();
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.maxDistance = 20000;
    this.controls.minDistance = 50;

    const self = this
    window.addEventListener("pointermove", (e) => {
      self.mouseMoveHandler(e)
    });
  }

  mouseMoveHandler(event:Event) {
    event.preventDefault();
    let mouse = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
  }

  private crateSkyBox() {
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
}
