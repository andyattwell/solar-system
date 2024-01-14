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
      if (self.parent.camera) {
        if (e.deltaY < 0) {
          if (self.parent.camera.position.z > 50) {
            self.parent.camera.translateZ( -100 )
            self.parent.controls.update();
          }
        } else {
          if (self.parent.camera.position.z < 40000) {
            self.parent.camera.translateZ( 100 )
            self.parent.controls.update();
          }
        }
      }
    });

    window.addEventListener("contextmenu", (e) => {
      self.parent.selectedPlanet = null;
      self.parent.camera.lookAt(0, 0, 0);
      self.parent.controls.target = new THREE.Vector3(0,0,0);
    });

    // window.addEventListener('click', (e) => {
    //   self.clickHandler(e);
    // })

    // window.addEventListener("pointermove", (e) => {
    //   self.mouseMoveHandler(e)
    // });
  }

  mouseMoveHandler(e:MouseEvent) {
    if (!this.parent.camera) {
      return false;
    }

    this.mouse.set((e.clientX / this.parent.canvas.clientWidth) * 2 - 1, -(e.clientY / this.parent.canvas.clientHeight) * 2 + 1)
    this.raycaster.setFromCamera(this.mouse, this.parent.camera)
    this.intersects = this.raycaster.intersectObjects(this.parent.scene.children, true)

    Object.keys(this.hovered).forEach((key) => {
      const hit = this.intersects.find((hit) => hit.object.uuid === key)
      if (hit === undefined) {
        const hoveredItem = this.hovered[key]
        // on pointer out
        //this.parent.mapa.removePreview();
        delete this.hovered[key]
      }
    })

    if (this.intersects.length) {
      const hit = this.intersects[0]
      if (!this.hovered[hit.object.uuid]) {
        // item hovered
        if (hit.object.name !== 'skybox') {
          this.hovered[hit.object.uuid] = hit
          // console.log('hovered', hit.object)
        }
      }
    }

    return true;
  }


  clickHandler(e:MouseEvent) {

    if (e.which === 1) {
      const hit = this.intersects[0];
      if (hit && hit.object.name !== 'skybox') {
        console.log(hit.object.parent.name)
      }
    }
  }

}