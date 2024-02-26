import * as THREE from 'three';
import { Planet } from './Planet';

export class IOController {
  public parent:any;
  private intersects:Array<any> = [];
  private hovered:any = {};
  private raycaster:THREE.Raycaster = new THREE.Raycaster();
  private mouse:THREE.Vector2 = new THREE.Vector2();
  public keysPressed: any = {};
  private targets: Array<any> = [];

  constructor(parent:any) {
    this.parent = parent;
    this.init();
  }

  init () {
    const self = this;
    
    this.parent.planets.forEach((_planet:any) => {
      self.targets.push(_planet)
      _planet?.moons?.forEach((_moon: Planet) => {
        self.targets.push(_moon)
      });
    });
    
    window.addEventListener('resize', () => {
      self.parent.cameraManager.setAspectRatio();
    })

    window.addEventListener('click', (e) => {
      self.clickHandler(e);
    })
    
    window.addEventListener('dblclick', (e) => {
      self.doubleClickHandler(e);
    })

    window.addEventListener("pointermove", (e) => {
      self.mouseMoveHandler(e)
    });

    
    window.addEventListener('keydown', (event) => {
      if (self.parent.cameraManager.camera.name === 'player') {
        self.playerMovementHandler(event);
      }

    }, false);

    window.addEventListener('keyup', (event) => {
      if (self.parent.cameraManager.camera.name === 'player') {
        if (!self.parent.player.characterControls) { return; }
        (self.keysPressed as any)[event.key.toLowerCase()] = false
      }
    }, false);
  }

  private playerMovementHandler(event:any) {
    if (!this.parent.player.characterControls) return;
    if (event.shiftKey) {
      this.parent.player.characterControls.switchRunToggle()
    } else if (event.key === 'Escape') {
      this.parent.player.characterControls.removeTarget()
    } else {
      (this.keysPressed as any)[event.key.toLowerCase()] = true
    }
  }

  mouseMoveHandler(e:MouseEvent):void {
    if (e.target !== this.parent.canvas) {
      return;
    }
    const width = this.parent.canvas.parentElement?.clientWidth || 1;
    const height = this.parent.canvas.parentElement?.clientHeight || 1;
    const x = (e.clientX / width) * 2 - 1;
    const y = -(e.clientY / height) * 2 + 1
    
    this.mouse.set(x, y)
    this.raycaster.setFromCamera(this.mouse, this.parent.activeCamera)
    this.intersects = this.raycaster.intersectObjects(this.targets, true)

    if (this.intersects.length > 0) {
      this.hovered = this.intersects[0].object
    } else {
      this.hovered = null
    }
  }

  doubleClickHandler(e:MouseEvent): void {
    if (e.target === this.parent.canvas && this.hovered?.parent) {
      this.parent.selectPlanet(this.hovered.parent);
      // this.parent.openDialog(this.hovered.parent);
      // this.parent.cameraManager.lookAtPlanet(this.hovered.parent);
      this.parent.player.setTarget(this.hovered.parent);
    }
    e.stopPropagation();
  }

  clickHandler(e:MouseEvent) {
    if (e.target === this.parent.canvas && this.hovered?.parent) {
      this.parent.selectPlanet(this.hovered.parent);
    }
  }

}