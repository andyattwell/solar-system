import * as THREE from 'three';
import PlanetMaterial from '../shaders/PlanetMaterial';
import AtmosMaterial from '../shaders/AtmosMaterial';
import OrbitMaterial from '../shaders/OrbitMaterial';
import RingMaterial from '../shaders/RingMaterial';

export interface PlanetProps {
  name: string;
  size: number;
  orbit: number;
  orbitSpeed?:number;
  texture: string;
  bump?: string;
  icon: string;
  rotationSpeed: number;
  rotationDir?: boolean;
  ring?: {
    texture?: string,
    innerRadius: number,
    outerRadius: number
  };
  color?: {
    r: number,
    g: number,
    b: number
  },
  position?: {
    x: number,
    y: number,
    z: number
  }
  moons?: Array<any>
  // Todo. Add actual data to show in dialog
  facts?: {

  }
}

export class Planet extends THREE.Object3D {
  private loader = new THREE.TextureLoader();
  private orbitPath!:THREE.Mesh;
  private ring!:THREE.Mesh;
  // public name: string = '';
  public container:THREE.Object3D = new THREE.Object3D();
  public planet:THREE.Mesh = new THREE.Mesh();
  public size: number;
  public velocity: THREE.Vector2 = new THREE.Vector2(0, 0);
  public rotate: boolean = true;
  public rotationSpeed: number = 0.01;
  public rotationDir: boolean = false;
  public angle: number = 0;
  public orbit: number = 0;
  private orbitY: number = 0;
  public orbitSpeed: number = 0;
  public showOrbit: boolean = false;
  public followOrbit: boolean = false;

  private planetTexture: string;
  private planetBump?: string;
  public color: THREE.Vector3 = new THREE.Vector3(1,1,1);
  public planetIcon?: string;
  public orbitCenter: THREE.Object3D;

  public moons?: Array<Planet>;

  constructor(props: PlanetProps, orbitCenter: THREE.Object3D) {
    super();

    this.orbitCenter = orbitCenter;
    
    this.size = props.size;
    this.name = props.name;
    this.planetIcon = props.icon;
    this.planetTexture = props.texture || '';
    this.planetBump = props.bump;

    if (props.color) {
      this.color = new THREE.Vector3(
        props.color.r, props.color.g, props.color.b
      )
    }

    this.orbitY = props.position?.y || 0;
    this.container.position.y = this.orbitY;
    this.rotationDir = props.rotationDir || false;
    this.rotationSpeed = props.rotationSpeed / 60 / 60 / 10;

    this.orbit = props.orbit !== 0 ? props.orbit: 0;
    this.orbitSpeed = props.orbitSpeed ? props.orbitSpeed * 0.001 : 0;
    this.angle = ((this.angle + Math.PI / 360 * this.orbitSpeed) % (Math.PI * 2)) * 10000000;

    this.createPlanet();
    this.setPositionToOrbit(0, true);

    if (props.name === 'Sun') {
      this.addLight();
    }

    if (props.moons) {
      this.addMoons(props.moons);
    }

    if (props.ring) {
      this.addRings(props.ring);
    }

  }

  private createPlanet() {
    this.planet.geometry = new THREE.SphereGeometry(this.size, 64, 32);
    if (this.name === 'Sun') {
      this.planet.material = new THREE.MeshBasicMaterial({
        map: this.loader.load(this.planetTexture) 
      });
    } else {
      this.planet.material = new THREE.MeshLambertMaterial({
        map: this.loader.load(this.planetTexture),
        side: THREE.FrontSide
      });
      // if (this.planetBump) {
      //   const normalTexture = new THREE.TextureLoader().load(this.planetBump)
      //   this.material.normalMap = normalTexture
      //   this.material.normalScale.set(0.5, 0.5)
      // }
    }

    this.addAtmosphere();
    this.add(this.planet);
    this.container.add(this);
    this.orbitCenter.add(this.container);
  }

  private addMoons(moonsProps:any) {
    const self = this;
    let moons:Array<Planet> = [];
    moonsProps.forEach((_moonData: PlanetProps) => {
      const moon = new Planet(_moonData, self.container);
      moons.push(moon);
    });
    self.moons = moons;
  }

  private addAtmosphere() {
    if (!this.color) return;

    const geo = new THREE.SphereGeometry(this.size, 64, 32);
   
    const mat = new THREE.ShaderMaterial({
      fragmentShader: AtmosMaterial.fragmentShader,
      vertexShader: AtmosMaterial.vertexShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        globeColor: {
          value: this.color,

        }
      }
    });
    const atmos = new THREE.Mesh(geo, mat);
    atmos.scale.set(1.1,1.1,1.1)
    this.container.add(atmos)
  }

  public toggleShowOrbit(show: boolean) {
    this.showOrbit = show
    if (show) {
      this.addOrbitPath()
    } else {
      this.removeOrbitPath()
    }
  }

  private addOrbitPath() {
    if (!this.orbitCenter || !this.orbit || this.orbit === 0) {
      return;
    }
    this.removeOrbitPath()
    const half = this.size / 2;
    this.orbitPath = new THREE.Mesh(
      new THREE.RingGeometry(
        this.orbit - half, 
        this.orbit + half,
        240, 
        3, 
        0, 
        Math.PI * 2
      ), 
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.color.x, this.color.y, this.color.z),
        side: THREE.DoubleSide
      })
      );
    this.orbitPath.rotation.x = Math.PI * 0.5;
    this.orbitPath.position.y = this.container.position.y -this.size - 0.001;
    this.orbitPath.geometry;
    this.orbitCenter.add(this.orbitPath);

    if (this.moons?.length) {
      this.moons.forEach((_moon:Planet) => {
        _moon.addOrbitPath();
      })
    }

  }

  public removeOrbitPath() {
    if (this.orbitPath) {
      this.orbitCenter.remove(this.orbitPath)
      if (this.moons?.length) {
        this.moons.forEach((_moon:Planet) => {
          _moon.addOrbitPath();
        })
      }
    }
  }

  public setPositionToOrbit(timeScale: number, followOrbit: boolean) {
    if (this.orbit <= 0 || !followOrbit){
      return;
    }
    
    // if (this.orbitCenter) {
    //   this.container.position.x = this.orbitCenter.position.x;
    //   this.container.position.y = this.orbitCenter.position.y;
    //   this.container.position.z = this.orbitCenter.position.z;
    // }

    this.container.position.x = this.orbit * Math.cos(this.angle);
    this.container.position.z = this.orbit * Math.sin(this.angle);
 
    const speed = this.orbitSpeed * timeScale;
    this.angle = ((this.angle + Math.PI / 360 * speed) % (Math.PI * 2))
  }

  private addLight() {
    var light = new THREE.PointLight(0x404040, 10000, 800000);
    light.intensity = 1000000;
    this.container.add(light);
  }

  private addRings(props: any) {
    let ringGeo = new THREE.RingGeometry(
      props.innerRadius + 0.1,
      props.outerRadius + 0.1, 
      32, 
      1, 
      0, 
      Math.PI * 2
    );
    const mat = new THREE.MeshLambertMaterial();
    mat.map = this.loader.load(props.texture)
    mat.side = THREE.DoubleSide;

    // const mat = new THREE.ShaderMaterial({
    //   fragmentShader: RingMaterial.fragmentShader,
    //   vertexShader: RingMaterial.vertexShader,
    //   blending: THREE.NormalBlending,
    //   side: THREE.DoubleSide,
    //   uniforms: {
    //     ringTexture: {
    //       value: new THREE.TextureLoader().load(props.texture),
    //     }
    //   }
    // });
    this.ring = new THREE.Mesh(ringGeo, mat);
    this.ring.rotation.x =  Math.PI * 0.5 + 0.05
    this.ring.rotation.y = 0.05;
    this.ring.rotation.z = 0.05;
    this.ring.name = "ring";
    this.container.add(this.ring);
  }

  public animate(timeScale: number) {
    
    if (this.rotate) {
      if (this.rotationDir) {
        this.planet.rotation.y -= this.rotationSpeed * timeScale;
      } else {
        this.planet.rotation.y += this.rotationSpeed * timeScale;
      }
    }

    this.setPositionToOrbit(timeScale, this.followOrbit);
    

    if (this.moons?.length) {
      this.moons.forEach((_moon:Planet) => {
        _moon.animate(timeScale);
      })
    }

  }
}