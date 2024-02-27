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

  @Input('timeScale') public timeScale = 0;
  private _planet?: Planet;

  @Input() set planet(value: Planet) {
    this._planet = value;
    this.group = this._planet.planet.clone();
    setTimeout(() => {
      this.createPreview();
    }, 100)
  }
  
  get planet(): Planet|undefined {
    return this._planet;
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
      0.1, 
      100
    );
  }

  clearScene() {
    const self = this;
    this.scene.children.forEach((c) => {
      self.scene.remove(c)
    })
  }

  createPreview() {
    if (!this._planet) { return }
    
    this.clearScene();

    this.group.position.setZ(-this._planet.size * 3)
    this.scene.add(this.group);

    let lightPosition = 0;
    if (this._planet.size < 0.1) {
      this.lightIntensity = 1;
      lightPosition = this._planet.size;
    } else if (this._planet.size >= 0.1 && this._planet.size < 0.5) {
      this.lightIntensity = 100;
      lightPosition = this._planet.size * 2;
    } else if (this._planet.size >= 0.5 && this._planet.size <= 3) {
      this.lightIntensity = 1000 * this._planet.size;
      lightPosition = this._planet.size * 2;
    } else if (this._planet.size >= 3) {
      this.lightIntensity = 20000;
      lightPosition = this._planet.size;
    }

    this.light.intensity = this.lightIntensity;
    this.light.position.setZ(lightPosition)
    this.scene.add(this.light);
    this.scene.add(this.camera);
    this.startRenderingLoop();
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
    if (this.planet?.rotate) {
      if (this.planet?.rotationDir) {
        this.group.rotation.y -= this.planet.rotationSpeed * this.timeScale;
      } else {
        this.group.rotation.y += this.planet.rotationSpeed * this.timeScale;
      }
    }
  }
}
