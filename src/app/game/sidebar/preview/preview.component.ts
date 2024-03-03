import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { Planet } from '../../../../classes/Planet';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent implements AfterViewInit {

  public timeScale = 1;
  @Input('type') public type = 'planet';
  @Input('size') public size = 1;
  @Input('rotate') public rotate = true;
  @Input('rotationDir') public rotationDir = true;
  @Input('rotationSpeed') public rotationSpeed = 0.01;

  private _model?: THREE.Object3D;

  @Input() set model(value: THREE.Object3D) {
    this._model = value;
    this.group = this._model.clone();

    setTimeout(() => {
      this.createPreview();
    }, 1)
  }
  
  get model(): THREE.Object3D|undefined {
    return this._model;
  }

  @ViewChild('preview')
  private previewRef!: ElementRef;
  public get preview(): HTMLCanvasElement {
    return this.previewRef?.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group = new THREE.Object3D;
  private light = new THREE.PointLight(0x504030, 10000, 800000);
  private lightIntensity = 500;
  
  ngAfterViewInit(): void {
    // this.createScene();
  }

  createScene(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.preview,
      antialias: true,
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.PerspectiveCamera(
      45, 
      this.preview.clientWidth / this.preview.clientHeight, 
      0.001, 
      1000
    );
  }

  clearScene() {
    const self = this;
    console.log('clearScene');
    this.scene?.children.forEach((c) => {
      self.scene.remove(c)
    })
  }

  createPreview() {
    if (!this._model) { return }
    
    if (this.scene) {
      this.clearScene();
    } else {
      this.createScene();
    }

    if (this.type === 'player') {
      this.shipPreview();
    } else if(this.type === 'planet'){
      this.planetPreview();
    }
    

    this.startRenderingLoop();
  }

  private planetPreview() {
    this.group.position.setZ(-this.size * 3)
    
    let lightPosition = 1000;
    if (this.size < 0.1) {
      this.lightIntensity = 1;
      lightPosition = this.size;
    } else if (this.size >= 0.1 && this.size < 0.5) {
      this.lightIntensity = 100;
      lightPosition = this.size * 2;
    } else if (this.size >= 0.5 && this.size <= 3) {
      this.lightIntensity = 1000 * this.size;
      lightPosition = this.size * 2;
    } else if (this.size >= 3) {
      this.lightIntensity = 20000;
      lightPosition = this.size;
    }

    this.light.intensity = this.lightIntensity;
    this.light.position.setZ(lightPosition);

    this.scene.add(this.group);
    this.scene.add(this.light);
    this.scene.add(this.camera);
  }

  private shipPreview() {

    this.camera.position.setY(this.group.position.y + 0.002 )
    this.camera.position.setX(this.group.position.x + 0.002 )
    this.camera.position.setZ(this.group.position.z + 0.002 )

    this.camera.lookAt(this.group.position);

    let lightPosition = 10;
    this.lightIntensity = 20000;

    this.light.intensity = this.lightIntensity;
    this.light.position.setZ(lightPosition);
    this.light.position.setY(lightPosition);

    this.scene.add(this.group);
    this.scene.add(this.light);
    this.scene.add(this.camera);
  }

  private startRenderingLoop() {
    let component: PreviewComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
      component.animate();
    }())
  }

  private animate() {
    if (this.rotate) {
      if (this.rotationDir) {
        this.group.rotation.y -= this.rotationSpeed * this.timeScale;
      } else {
        this.group.rotation.y += this.rotationSpeed * this.timeScale;
      }
    }
  }
}
