import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Planets from "../../assets/planets.json"

interface PlanetProps {
  name: string;
  size: number;
  texture: string;
  position: {
    x: number,
    y: number,
    z: number
  };
  rotationSpeed: {
    x: number,
    y: number,
    z: number
  };
  translationSpeed: {
    x: number,
    y: number,
    z: number
  };
  ring?: {
    texture?: string,
    innerRadius: number,
    outerRadius: number
  }
}

class Planet {
  private size: number;
  private loader = new THREE.TextureLoader();

  private rotationSpeedX: number = 0;
  private rotationSpeedY: number = 0.01;
  private rotationSpeedZ: number = 0;

  private translationSpeedX: number = 0;
  private translationSpeedY: number = 0.01;
  private translationSpeedZ: number = 0;

  private scaleSizeFactor: number = 1;
  private scaleDistanceFactor: number = 0.1;

  private texture: string;

  public mesh: THREE.Mesh;

  constructor(props: PlanetProps) {

    this.size = props.size * this.scaleSizeFactor;
    console.log(props.name, this.size)
    this.texture = props.texture;

    this.rotationSpeedX = props.rotationSpeed.x;
    this.rotationSpeedY = props.rotationSpeed.y;
    this.rotationSpeedZ = props.rotationSpeed.z;

    if (props.translationSpeed) {
      this.translationSpeedX = props.translationSpeed.x;
      this.translationSpeedY = props.translationSpeed.y;
      this.translationSpeedZ = props.translationSpeed.z;
    }
    
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0));

    const planetGeo = new THREE.SphereGeometry(this.size);
    let planetMat;
    if (props.name === 'Sun') {
      planetMat = new THREE.MeshBasicMaterial();
    } else {
      planetMat = new THREE.MeshLambertMaterial();
    }
    planetMat.map = this.loader.load(this.texture)

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.name = "planet";
    

    if (props.name === 'Sun') {
      var light = new THREE.PointLight(0x404040, 10000, 800000);
      light.intensity = 100000;
      planet.add(light);
      console.log('ACA')
    } else {
      planet.position.x = props.position.x * this.scaleDistanceFactor + 12
      planet.position.y = props.position.y
      planet.position.z = props.position.z
    }

    if (props.ring) {
      let ringGeo = new THREE.RingGeometry(props.ring?.innerRadius, props.ring?.outerRadius, 20, 3, 0, Math.PI * 2);
      const ringMat = new THREE.MeshLambertMaterial({
        map: props.ring.texture ? this.loader.load(props.ring.texture): null,
        // color: 0x000000,
        side: THREE.DoubleSide
      })
      let ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(planet.position.x, planet.position.y, planet.position.z);
      ring.rotation.x =  Math.PI * 0.5 + 0.05
      ring.rotation.y = 0.05;
      ring.rotation.z = 0.05;
      ring.name = "ring";

      this.mesh.add(ring);
    }
    

    this.mesh.add(planet)
  }

  public animate() {
    // this.mesh.rotation.y += this.translationSpeedY;
    // this.mesh.rotation.x += this.translationSpeedX;
    // this.mesh.rotation.z += this.translationSpeedZ;

    for (let i = 0; i < this.mesh.children.length; i++) {
      if (this.mesh.children[i].name === 'planet') {
        this.mesh.children[i].rotation.y += this.rotationSpeedY;
        this.mesh.children[i].rotation.x += this.rotationSpeedX;
        this.mesh.children[i].rotation.z += this.rotationSpeedZ;
      }
    }
  }
}

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
  @Input('farClipping') public farClippingPlane: number = 50000;

  private camera!: THREE.PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene; 
  private planets:Array<Planet> = [];

  private controls!: OrbitControls;

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
    light.intensity = 2;
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
      self.scene.add(planet.mesh);
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
    this.controls.maxDistance = 10000;
    this.controls.minDistance = 100;
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
    this.scene.add(skybox);
  }
}
