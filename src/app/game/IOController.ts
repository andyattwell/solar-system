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

  updateIntersects():void {
    if (!this.parent.camera) {
      return;
    }
      // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.parent.camera);

    // calculate objects intersecting the picking ray
    let planets = this.parent.scene.children.filter(
      (p:any) => (p.name !== '' && p.name !== 'skybox')
    ).map((p:any) => {
      return p.planet
    })
    var intersects = this.raycaster.intersectObjects(planets);

    Object.keys(this.hovered).forEach((key) => {
      const hit = intersects.find((hit) => hit.object.uuid === key)
      if (hit === undefined) {
        // on pointer out
        delete this.hovered[key]
      }
    })

    if (intersects.length > 0) {
      const hit = intersects[0]
      console.log(intersects)
      if (!this.hovered[hit.object.uuid]) {
        // item hovered
        this.hovered[hit.object.uuid] = hit.object
      }
    }
  }

  mouseMoveHandler(e:MouseEvent):void {
    if (e.target !== this.parent.canvas) {
      return;
    }
    this.mouse.set(
      (e.clientX / this.parent.canvas.clientWidth) * 2 - 1, 
      -(e.clientY / this.parent.canvas.clientHeight) * 2 + 1
    )
    this.raycaster.setFromCamera(this.mouse, this.parent.camera)
    let planets = this.parent.scene.children.filter(
      (p:any) => (p.name !== '' && p.name !== 'skybox' && p.name !== "orbitring")
    ).map((p:any) => {
      return p.planet
    })
    // let planets = this.parent.planets;
    this.intersects = this.raycaster.intersectObjects(planets, true)
    if (this.intersects.length > 0) {
      this.hovered = this.intersects[0].object
    } else {
      this.hovered = null
    }

    
  }


  clickHandler(e:MouseEvent) {

    const hit = this.hovered;
    console.log('click', hit)
    // if (hit && hit.object.name !== 'skybox') {
    //   console.log(hit.object.parent.name)
    // }
    this.parent.planets.forEach((o: THREE.Mesh, i:number) => {
      if (this.hovered && this.hovered.uuid === o.uuid) {
        console.log('click 2', this.parent.planets[i])
      }
    })
  }

}