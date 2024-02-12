import * as THREE from 'three';

export class IOController {
  public parent:any;
  private intersects:Array<any> = [];
  private hovered:any = {};
  private raycaster:THREE.Raycaster = new THREE.Raycaster();
  private mouse:THREE.Vector2 = new THREE.Vector2();

  constructor(parent:any) {
    this.parent = parent
    this.init();
  }

  init () {
    const self = this;
    window.addEventListener('resize', () => {
      self.parent.setAspectRatio();
    })
    
    window.addEventListener( 'wheel', function(e:any){
      if (e.target === self.parent.canvas && self.parent.camera) {

        const currentZ = Math.abs(self.parent.camera.position.z);
        if (currentZ <= 0) {
          return;
        }
        
        let step = 1;
        if (currentZ >= 2000) {
          step = 500;
        } else if (currentZ < 2000 && currentZ >= 500) {
          step = 100;
        } else if (currentZ < 500 && currentZ >= 100) {
          step = 10;
        } else {
          step = 5;
        }

        if (e.deltaY < 0) {
          self.parent.camera.translateZ( -step )
          self.parent.controls.update();
        } else {
          self.parent.camera.translateZ( step )
          self.parent.controls.update();
        }
      }
    });

    window.addEventListener("contextmenu", (e) => {
      // if (self.parent.selectedPlanet) {
      //   self.parent.selectedPlanet = null;
      //   self.parent.camera.lookAt(0, 0, 0);
      //   self.parent.controls.target = new THREE.Vector3(0,0,0);
      // }
    });

    window.addEventListener('click', (e) => {
      self.clickHandler(e);
    })

    window.addEventListener("pointermove", (e) => {
      self.mouseMoveHandler(e)
    });
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
    this.raycaster.setFromCamera(this.mouse, this.parent.camera)
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


  clickHandler(e:MouseEvent) {
    if (this.hovered?.parent) {
      this.parent.selectPlanet(this.hovered.parent);
      this.hovered = null
    }
  }

}