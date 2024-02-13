import * as THREE from 'three';
import PlanetMaterial from '../../shaders/PlanetMaterial';
import AtmosMaterial from '../../shaders/AtmosMaterial';
import OrbitMaterial from '../../shaders/OrbitMaterial';
import RingMaterial from '../../shaders/RingMaterial';

export interface PlanetProps {
  name: string;
  size: number;
  mass: number;
  orbit: number;
  orbitSpeed?:number;
  texture: string;
  icon: string;
  position: {
    x: number,
    y: number,
    z: number
  };
  rotation: {
    x: number,
    y: number,
    z: number,
    dir?: boolean
  };
  ring?: {
    texture?: string,
    innerRadius: number,
    outerRadius: number
  };
  color: {
    r: number,
    g: number,
    b: number
  }
  // Todo. Add actual data to show in dialog
  facts?: {

  }
}

export class Planet extends THREE.Mesh {
  private loader = new THREE.TextureLoader();
  private orbitPath!:THREE.Mesh;
  private ring!:THREE.Mesh;

  public planet:THREE.Mesh = new THREE.Mesh();
  public size: number;
  public mass: number;
  public velocity: THREE.Vector2 = new THREE.Vector2(0, 0);
  public rotate: boolean = true;
  public rotationSpeedY: number = 0.01;
  public rotationDir: boolean = false;
  public angle: number = 0;
  public orbit: number = 0;
  public orbitSpeed: number = 0;
  public showOrbit: boolean = false;
  public followOrbit: boolean = false;

  private planetTexture: string;
  public color: THREE.Vector3;
  public planetIcon: string;

  constructor(props: PlanetProps) {
    super(new THREE.SphereGeometry(0));

    this.size = props.size;
    this.name = props.name;
    this.mass = props.mass;
    this.planetIcon = props.icon;
    this.planetTexture = props.texture || '';
    
    this.color = new THREE.Vector3(
      props.color.r, props.color.g, props.color.b
    )

    this.rotationDir = props.rotation.dir || false;
    this.rotationSpeedY = 1 / props.rotation.y;
    this.orbit = props.orbit;

    if (props.orbitSpeed) {
      this.orbitSpeed = props.orbitSpeed * 0.001;
    }

    this.createPlanet();
    
    this.setPositionToOrbit({
      position: {
        x: 0,
        y: 0,
        z: 0
      }
    }, 1);

    if (props.name === 'Sun') {
      this.addLight();
    }

    if (props.ring) {
      this.addRings(props.ring);
    }

    if (this.showOrbit) {
      this.addOrbitPath();
    }

  }

  private createPlanet() {
    const planetGeo = new THREE.SphereGeometry(this.size, 64, 32);

    const mat = new THREE.ShaderMaterial({
      fragmentShader: PlanetMaterial.fragmentShader,
      vertexShader: PlanetMaterial.vertexShader,
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load(this.planetTexture),
        },
        globeColor: {
          value: this.color
        }
      }
    });

    this.planet = new THREE.Mesh(planetGeo, mat);
    this.planet.name = "planet";
    this.add(this.planet);

    this.addAtmosphere();
  }

  private addAtmosphere() {
    const geo = new THREE.SphereGeometry(this.size, 64, 32);
   
    const mat = new THREE.ShaderMaterial({
      fragmentShader: AtmosMaterial.fragmentShader,
      vertexShader: AtmosMaterial.vertexShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        globeColor: {
          value: this.color
        }
      }
    });
    const atmos = new THREE.Mesh(geo, mat);
    atmos.scale.set(1.1,1.1,1.1)
    this.planet.add(atmos)
  }

  public toggleOrbit(show: boolean) {
    this.showOrbit = show
    if (show) {
      this.addOrbitPath()
    } else {
      this.removeOrbitPath()
    }
  }

  private addOrbitPath() {
    if (!this.orbit || this.orbit === 0) {
      return;
    }

    this.removeOrbitPath()
    
    let orbitPathGeo = new THREE.RingGeometry(
      this.orbit - this.size / 2, 
      this.orbit + this.size / 2,
      120, 
      3, 
      0, 
      Math.PI * 2
    );

    const mat = new THREE.ShaderMaterial({
      fragmentShader: OrbitMaterial.fragmentShader,
      vertexShader: OrbitMaterial.vertexShader,
      side: THREE.DoubleSide,
      uniforms: {
        globeColor: {
          value: new THREE.Vector3(0.4, 0.4, 0.4)
        }
      }
    });

    this.orbitPath = new THREE.Mesh(orbitPathGeo, mat);
    this.orbitPath.rotation.x =  Math.PI * 0.5;
    this.orbitPath.position.y = - this.size - 0.2;
    this.orbitPath.name = "orbitPath";
    this.orbitPath.geometry;
    this.add(this.orbitPath);

  }

  public removeOrbitPath() {
    if (this.orbitPath) {
      this.remove(this.orbitPath)
    }
  }

  public setPositionToOrbit(parent:any, timeScale: number) {
    this.planet.position.x = parent.position.x + this.orbit * Math.cos(this.angle);
    this.planet.position.z = parent.position.y + this.orbit * Math.sin(this.angle);
    
    const speed = this.orbitSpeed * timeScale;
    this.angle = ((this.angle + Math.PI / 360 * speed) % (Math.PI * 2))
  }

  private addLight() {
    var light = new THREE.PointLight(0x404040, 10000, 800000);
    light.intensity = 100000;
    this.add(light);
  }

  private addRings(props: any) {
    let ringGeo = new THREE.RingGeometry(props.innerRadius + 0.1, props.outerRadius + 0.1, 20, 3, 0, Math.PI * 2);
    
    const mat = new THREE.ShaderMaterial({
      fragmentShader: RingMaterial.fragmentShader,
      vertexShader: RingMaterial.vertexShader,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        ringTexture: {
          value: new THREE.TextureLoader().load(props.texture),
        }
      }
    });
    this.ring = new THREE.Mesh(ringGeo, mat);
    this.ring.rotation.x =  Math.PI * 0.5 + 0.05
    this.ring.rotation.y = 0.05;
    this.ring.rotation.z = 0.05;
    this.ring.name = "ring";
    this.planet.add(this.ring);
  }

  public animate(sun: Planet, timeScale: number) {

    if (this.rotate) {
      if (this.rotationDir) {
        this.planet.rotation.y -= this.rotationSpeedY * timeScale;
      } else {
        this.planet.rotation.y += this.rotationSpeedY * timeScale;
      }
    }

    if (this.name !== 'Sun' && this.followOrbit) {
      this.setPositionToOrbit(sun, timeScale);
    }

  }
}