import * as THREE from 'three';

export class IOControler {
  public parent:any;
  private intersects:Array<any> = [];
  private hovered:any = {};
  private raycaster:THREE.Raycaster = new THREE.Raycaster();
  private mouse:THREE.Vector2 = new THREE.Vector2() ;
  private dragging:boolean = false;
  private dragStart:any = null;

  constructor(parent:any) {
    this.parent = parent
    this.init();
  }

  init () {
    const self = this;

    window.addEventListener('click', (e) => {
      self.clickHandler(e);
    })

    window.addEventListener("pointermove", (e) => {
      self.mouseMoveHandler(e)
    });
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