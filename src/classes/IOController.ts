import * as THREE from 'three';

export class IOController {
  public parent:any;
  private intersects:Array<any> = [];
  private hovered:any = {};
  private raycaster:THREE.Raycaster = new THREE.Raycaster();
  private mouse:THREE.Vector2 = new THREE.Vector2();
  public keysPressed: any = {};

  constructor(parent:any) {
    this.parent = parent
    this.init();
  }

  init () {
    const self = this;
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
    let planets = this.parent.planets.map((p:any) => {
      return p.planet
    })

    this.intersects = this.raycaster.intersectObjects(planets, true)
    
    if (this.intersects.length > 0) {
      this.hovered = this.intersects[0].object
    } else {
      this.hovered = null
    }
  }

  doubleClickHandler(e:MouseEvent): void {
    if (e.target === this.parent.canvas && this.hovered?.parent) {
      this.parent.selectPlanet(this.hovered.parent);
      this.parent.openDialog(this.hovered.parent.planet);
      this.parent.cameraManager.lookAtPlanet(this.hovered.parent);
    }
    e.stopPropagation();
  }

  clickHandler(e:MouseEvent) {
    if (e.target === this.parent.canvas && this.hovered?.parent) {
      this.parent.selectPlanet(this.hovered.parent);
    }
  }

}