import * as THREE from 'three';

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
  // Todo. Add actual data to show in dialog
  facts?: {

  }
}

export class Planet extends THREE.Mesh {
  private loader = new THREE.TextureLoader();
  private orbitRing!:THREE.Mesh;
  private ring!:THREE.Mesh;
  private rotationDir: boolean = false;

  public planet:THREE.Mesh;
  public size: number;
  public mass: number;
  public velocity: THREE.Vector2 = new THREE.Vector2(0, 0);
  public rotationSpeedY: number = 0.01;
  public angle: number = 0;
  public orbit: number = 0;
  public orbitSpeed: number = 0;
  public showOrbit: boolean = true;
  public followOrbit: boolean = false;

  private planetTexture: string;
  public planetIcon: string;

  constructor(props: PlanetProps) {
    super(new THREE.SphereGeometry(0));

    this.size = props.size;
    this.name = props.name;
    this.mass = props.mass;
    this.planetIcon = props.icon;

    this.rotationDir = props.rotation.dir || false;
    this.rotationSpeedY = 1 / props.rotation.y;
    this.orbit = props.orbit;

    if (props.orbitSpeed) {
      this.orbitSpeed = props.orbitSpeed * 0.001;
    }

    const planetGeo = new THREE.SphereGeometry(this.size, 64, 32);
    this.planetTexture = props.texture || '';
    let planetMat;
    if (props.name === 'Sun') {
      planetMat = new THREE.MeshBasicMaterial();
    } else {
      planetMat = new THREE.MeshLambertMaterial();
    }

    planetMat.map = this.loader.load(this.planetTexture)

    this.planet = new THREE.Mesh(planetGeo, planetMat);
    this.planet.name = "planet";
    this.add(this.planet)

    if (props.name === 'Sun') {
      this.addLight()
    } else {
      this.setPositionToOrbit({
        position: {
          x: 0,
          y: 0,
          z: 0
        }
      }, 1);
    }

    if (props.ring) {
      this.addRings(props.ring);
    }

    if (this.showOrbit) {
      this.addOrbitRing();
    }

  }

  public get orbitRadius() {
    return this.orbit
  }

  public set orbitRadius(orbit) {
    this.orbit = orbit
    this.addOrbitRing();
  }

  private addOrbitRing() {
    if (!this.orbit || this.orbit === 0) {
      return;
    }

    this.removeOrbitRing()
    
    let orbitRingGeo = new THREE.RingGeometry(
      this.orbit - this.size / 2, 
      this.orbit + this.size / 2,
      120, 
      3, 
      0, 
      Math.PI * 2
    );

    const orbitRingMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    })
    this.orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    this.orbitRing.rotation.x =  Math.PI * 0.5
    this.orbitRing.position.y = - this.size - 0.1
    this.orbitRing.name = "orbitring";
    this.orbitRing.geometry
    this.add(this.orbitRing);

  }

  public toggleOrbit(show: boolean) {
    this.showOrbit = show
    if (show) {
      this.addOrbitRing()
    } else {
      this.removeOrbitRing()
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
    let ringGeo = new THREE.RingGeometry(props.innerRadius, props.outerRadius, 20, 3, 0, Math.PI * 2);
    const ringMat = new THREE.MeshLambertMaterial({
      map: props.texture ? this.loader.load(props.texture): null,
      side: THREE.DoubleSide
    })
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x =  Math.PI * 0.5 + 0.05
    this.ring.rotation.y = 0.05;
    this.ring.rotation.z = 0.05;
    this.ring.name = "ring";
    this.planet.add(this.ring);
  }

  public animate(sun: Planet, timeScale: number) {

    if (this.rotationDir) {
      this.planet.rotation.y -= this.rotationSpeedY * timeScale;
    } else {
      this.planet.rotation.y += this.rotationSpeedY * timeScale;
    }

    if (this.name !== 'Sun' && this.followOrbit) {
      this.setPositionToOrbit(sun, timeScale);
    }

  }

  public removeOrbitRing() {
    if (this.orbitRing) {
      this.remove(this.orbitRing)
    }
  }
}