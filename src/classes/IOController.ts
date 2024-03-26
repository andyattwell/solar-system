import * as THREE from 'three';
import { Planet } from './Planet';
import { Player } from './Player';

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
  }

  init (player: Player, star: Planet, planets: Array<Planet>) {
    const self = this;
    this.targets.push(player);
    this.targets.push(star);
    planets.forEach((_planet:any) => {
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
        if (event.key === ' ') {
          this.parent.player.characterControls.releaseBreak()
        } else {
          (self.keysPressed as any)[event.key.toLowerCase()] = false
        }
      }
    }, false);
  }

  private playerMovementHandler(event:any) {
    if (!this.parent.player.characterControls) return;
    if (event.shiftKey) {
      this.parent.player.characterControls.switchRunToggle()
    } else if (event.key === 'Escape') {
      this.parent.player.characterControls.removeTarget()
    } else if (event.key === 'q' || event.key === 'e') {
      this.parent.cameraManager.rotateCamera(event.key)
    } else if (event.key === ' ') {
      this.parent.player.characterControls.break()
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

  clickHandler(e:MouseEvent): void {
    // if (e.target === this.parent.canvas && this.hovered?.parent) {
    //   if (this.hovered.name === 'starship') {
    //     console.log('click', this.hovered)
    //   } else {
    //     this.parent.goToPlanet(this.hovered.parent);
    //   }
    // }
    e.stopPropagation();
  }

  doubleClickHandler(e:MouseEvent) {
    if (e.target === this.parent.canvas && this.hovered?.parent) {
      if (this.hovered.name === 'starship') {
        this.parent.player.lookAtShip();
        this.parent.openPlanetInfo('player', this.hovered);
      } else {
        this.parent.selectPlanet(this.hovered.parent);
      }
    }
  }

}