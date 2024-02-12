import * as THREE from 'three';

export interface PlanetProps {
  name: string;
  size: number;
  mass: number;
  orbit?: number;
  orbitSpeed?:number;
  texture: string;
  icon: string;
  position: {
    x: number,
    y: number,
    z: number
  };
  rotationSpeed: {
    x: number,
    y: number,
    z: number
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
  public size: number;
  // private mass: number;
  private loader = new THREE.TextureLoader();
  public planet:THREE.Mesh;
  private orbitRing!:THREE.Mesh;
  private ring!:THREE.Mesh;
  // private velocity: THREE.Vector2;

  private rotationSpeedX: number = 0;
  public rotationSpeedY: number = 0.01;
  private rotationSpeedZ: number = 0;

  public angle: number = 0;
  public orbit: number = 0;
  public orbitSpeed: number = 0;

  private scaleSizeFactor: number = 1;
  private scaleDistanceFactor: number = 0.5;

  public planetTexture: string;
  public planetIcon: string;

  constructor(props: PlanetProps) {
    super(new THREE.SphereGeometry(0));
    // this.velocity = new THREE.Vector2(props.rotationSpeed.y, props.rotationSpeed.y)
    // this.mass = props.mass;
    this.size = props.size;
    this.name = props.name;
    this.planetIcon = props.icon;

    this.rotationSpeedY = 1 / props.rotationSpeed.y;
    this.rotationSpeedX = 1 / props.rotationSpeed.x;
    this.rotationSpeedZ = 1 / props.rotationSpeed.z;

    if (props.orbit) {
      this.orbit = props.orbit * this.scaleDistanceFactor + 10;
    }

    if (props.orbitSpeed) {
      this.orbitSpeed = props.orbitSpeed * 0.001;
    }

    const planetGeo = new THREE.SphereGeometry(this.size, 64, 32);
    let planetMat;
    
    this.planetTexture = props.texture || '';
    if (props.name === 'Sun') {
      planetMat = new THREE.MeshBasicMaterial();
    } else {
      planetMat = new THREE.MeshLambertMaterial();
    }
    planetMat.map = this.loader.load(this.planetTexture)

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.name = "planet";
    this.planet = planet;
    this.add(planet)

    if (props.name === 'Sun') {
      this.addLight()
    } else {
      // this.planet.position.x = this.orbit / 2;
      // this.planet.position.y = 0;
      // this.planet.position.z = this.orbit / 2
      this.followOrbit({
        position: {
          x: 0,
          y: 0,
          z: 0
        }
      }, 1);
    }

    if (props.ring) {
      // this.addRings(props.ring);
    }

    // this.addOrbitRing();

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

    if (this.orbitRing) {
      this.remove(this.orbitRing)
    }
    
    const orbitRad = this.orbit;
    let orbitRingGeo = new THREE.RingGeometry(orbitRad-this.size / 2, orbitRad+this.size / 2, 60, 3, 0, Math.PI * 2);

    const orbitRingMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    })
    this.orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    this.orbitRing.rotation.x =  Math.PI * 0.5
    this.orbitRing.name = "orbitring";
    this.add(this.orbitRing);
    this.orbitRing.geometry
  }

  public followOrbit(parent:any, timeScale: number) {
    // const radius = parent.size + this.orbit;
    const radius = this.orbit;
    const speed = this.orbitSpeed * timeScale;
    
    const px = parent.position.x + radius * Math.cos(this.angle); // <-- that's the maths you need
    const pz = parent.position.y + radius * Math.sin(this.angle);
    
    if(this.name === 'Earth') {
      // console.log(this.name, this.angle, this.angle * speed)
    }

    this.planet.position.x = px;
    this.planet.position.z = pz;
    this.angle = ((this.angle + Math.PI / 360 * speed) % (Math.PI * 2))
  }

  private addLight() {
    var light = new THREE.PointLight(0x404040, 10000, 800000);
    light.intensity = 100000;
    this.add(light);
  }

  private addRings(props: any) {
    // let ringGeo = new THREE.RingGeometry(props.innerRadius, props.outerRadius, 20, 3, 0, Math.PI * 2);
    //   const ringMat = new THREE.MeshLambertMaterial({
    //     map: props.texture ? this.loader.load(props.texture): null,
    //     // color: 0x000000,
    //     side: THREE.DoubleSide
    //   })
    //   this.ring = new THREE.Mesh(ringGeo, ringMat);
    //   this.ring.rotation.x =  Math.PI * 0.5 + 0.05
    //   this.ring.rotation.y = 0.05;
    //   this.ring.rotation.z = 0.05;
    //   this.ring.name = "ring";
    //   this.planet.add(this.ring);
  }
  
  private degrees_to_radians(degrees:number):number {
    var pi = Math.PI;
    return degrees * (pi/180);
  }

  distance(position0: THREE.Vector3, position1: THREE.Vector3) {
    let d1 = Math.abs(position1.x - position0.x);
    let d2 = Math.abs(position1.y - position0.y);
    let d3 = Math.abs(position1.z - position0.z);
    return d1 + d2 + d3;
  }

  // public accelerate_due_to_gravity(first: Planet) {
    
  //   const force = first.mass * this.mass / this.distance(first.position, this.position) * 2
  //   const angle = first.position.angleTo(this.position)
  //   let reverse = 1
  //   let arr = []
  //   arr.push(first);
  //   arr.push(this);
  //   arr.forEach((body: any) => {
  //     const acceleration = force / body.mass
  //     const acc_x = acceleration * Math.cos(this.degrees_to_radians(angle))
  //     const acc_y = acceleration * Math.sin(this.degrees_to_radians(angle))
  //     body.velocity = new THREE.Vector2(
  //       body.velocity.x + (reverse * acc_x),
  //       body.velocity.y + (reverse * acc_y),
  //     )
  //     reverse = -1
  //   });
  //   console.log(this.name, this.position.x , this.position.y)

  //   this.position.x = this.position.x + this.velocity.x
  //   this.position.y = this.position.y + this.velocity.y
  // }

  public animate(sun: Planet, timeScale: number) {

    // this.planet.rotation.x += this.rotationSpeedX * this.timeScale;
    // this.planet.rotation.z += this.rotationSpeedZ * this.timeScale;

    if (this.name === 'Venus' || this.name === 'Uranus') {
      this.planet.rotation.y -= this.rotationSpeedY * timeScale;
    } else {
      this.planet.rotation.y += this.rotationSpeedY * timeScale;
    }

    if (this.name !== 'Sun') {
      // this.followOrbit(sun, timeScale);
    }
  }

  public select() {
    
  }
}