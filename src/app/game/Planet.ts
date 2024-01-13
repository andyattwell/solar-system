import * as THREE from 'three';

export interface PlanetProps {
  name: string;
  size: number;
  texture: string;
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
  translationSpeed: {
    x: number,
    y: number,
    z: number
  };
  ring?: {
    texture?: string,
    innerRadius: number,
    outerRadius: number
  }
}

export class Planet extends THREE.Mesh {
  private size: number;
  private loader = new THREE.TextureLoader();

  private rotationSpeedX: number = 0;
  private rotationSpeedY: number = 0.01;
  private rotationSpeedZ: number = 0;

  private translationSpeedX: number = 0;
  private translationSpeedY: number = 0.01;
  private translationSpeedZ: number = 0;

  private scaleSizeFactor: number = 1;
  private scaleDistanceFactor: number = 0.1;

  private planetTexture: string;

  constructor(props: PlanetProps) {
    super(new THREE.SphereGeometry(0));

    this.size = props.size * this.scaleSizeFactor;
    this.planetTexture = props.texture;

    this.rotationSpeedX = props.rotationSpeed.x;
    this.rotationSpeedY = props.rotationSpeed.y;
    this.rotationSpeedZ = props.rotationSpeed.z;

    this.name = props.name;

    if (props.translationSpeed) {
      this.translationSpeedX = props.translationSpeed.x;
      this.translationSpeedY = props.translationSpeed.y;
      this.translationSpeedZ = props.translationSpeed.z;
    }

    const planetGeo = new THREE.SphereGeometry(this.size);
    let planetMat;
    if (props.name === 'Sun') {
      planetMat = new THREE.MeshBasicMaterial();
    } else {
      planetMat = new THREE.MeshLambertMaterial();
    }
    planetMat.map = this.loader.load(this.planetTexture)

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.name = "planet";

    if (props.name === 'Sun') {
      var light = new THREE.PointLight(0x404040, 10000, 800000);
      light.intensity = 100000;
      planet.add(light);
    } else {
      planet.position.x = props.position.x * this.scaleDistanceFactor + 12
      planet.position.y = props.position.y
      planet.position.z = props.position.z
    }

    if (props.ring) {
      let ringGeo = new THREE.RingGeometry(props.ring?.innerRadius, props.ring?.outerRadius, 20, 3, 0, Math.PI * 2);
      const ringMat = new THREE.MeshLambertMaterial({
        map: props.ring.texture ? this.loader.load(props.ring.texture): null,
        // color: 0x000000,
        side: THREE.DoubleSide
      })
      let ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(planet.position.x, planet.position.y, planet.position.z);
      ring.rotation.x =  Math.PI * 0.5 + 0.05
      ring.rotation.y = 0.05;
      ring.rotation.z = 0.05;
      ring.name = "ring";

      this.add(ring);
    }

    // orbit ring
    const orbitRad = planet.position.x;
    let orbitRingGeo = new THREE.RingGeometry(orbitRad, orbitRad+0.05, 60, 3, 0, Math.PI * 2);
    const orbitRingMat = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide
    })
    let orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x =  Math.PI * 0.5

    orbitRing.name = "orbitring";

    this.add(orbitRing);

    this.add(planet)
  }

  public animate() {
    this.rotation.y += this.translationSpeedY;
    this.rotation.x += this.translationSpeedX;
    this.rotation.z += this.translationSpeedZ;

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].name === 'planet') {
        this.children[i].rotation.y += this.rotationSpeedY;
        this.children[i].rotation.x += this.rotationSpeedX;
        this.children[i].rotation.z += this.rotationSpeedZ;
      }
    }
  }

  public select() {
    
  }
}