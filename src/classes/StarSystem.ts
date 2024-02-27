import * as THREE from 'three';
// import SystemData from "../assets/data/planets.json";
import { Planet, PlanetProps } from "./Planet";

interface starSystem {
  name: string,
  star: PlanetProps,
  planets: Array<PlanetProps>
}

export class System {

  public name: string;
  public star: Planet;
  public planets: Array<Planet> = [];
  public mesh: THREE.Object3D = new THREE.Object3D();

  private skybox: THREE.Mesh = new THREE.Mesh();
  private skyboxSize: number = 6000;
  public showOrbit: boolean = false;
  public followOrbit: boolean = false;
  public rotationEnabled: boolean = true;

  constructor(data: starSystem) {
    this.name = data.name;
    this.star = new Planet(data.star, this.mesh);
    this.createPlanets(data.planets);
  }

  public startScene(scene: THREE.Scene) {
    this.crateSkyBox();
    scene.add(this.mesh);
  }

  private createPlanets(planets: Array<PlanetProps>) {
    const self = this;
    planets.forEach(props => {
      try {
        let planet = new Planet(props, this.mesh);
        self.planets.push(planet);
      } catch (error) {
        console.log({ error, props })
      }
    });
  }

  private crateSkyBox(): void {
    const skyTexture = new THREE.TextureLoader().load("/assets/textures/milky-way-2.jpg");
    const material = new THREE.MeshBasicMaterial({ 
      map: skyTexture,
      side: THREE.BackSide
    });
    const skyGeo = new THREE.SphereGeometry(this.skyboxSize, 25, 25); 
    this.skybox = new THREE.Mesh(skyGeo, material);
    this.skybox.name = "skybox";
    this.mesh.add(this.skybox);
  }

  public toggleShowOrbit(showOrbit:boolean): void {
    this.showOrbit = showOrbit;
    this.planets.forEach(planet => {
      planet.toggleShowOrbit(showOrbit);
    });
  }
  
  public toggleFollowOrbit(): void {
    const self = this;
    this.followOrbit = !this.followOrbit;
    this.planets.forEach((_planet:Planet) => {
      _planet.followOrbit = self.followOrbit
      
      if (_planet.moons?.length) {
        _planet.moons.forEach((_moon:Planet) => {
          _moon.followOrbit = self.followOrbit
        })
      }
    })
  }
  
  public toggleRotation(): void {
    this.rotationEnabled = !this.rotationEnabled;
    this.planets.forEach(p => {
      p.rotate = this.rotationEnabled
    })
  }


}