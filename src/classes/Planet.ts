import * as THREE from 'three';
import PlanetMaterial from '../shaders/PlanetMaterial';
import AtmosMaterial from '../shaders/AtmosMaterial';
import OrbitMaterial from '../shaders/OrbitMaterial';
import RingMaterial from '../shaders/RingMaterial';
import { degrees_to_radians } from '../helpers';

export interface PlanetProps {
  name: string;
  size: number;
  star?: boolean;
  orbit: number;
  orbitOffset?: {
    x: number,
    y: number,
    z: number
  };
  orbitSpeed?:number;
  texture: string;
  bump?: string;
  icon: string;
  rotationSpeed: number;
  rotationDir?: boolean;
  axialTilt?: number;
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
  public ringTexture: string = '';
  
  public ringInnerRadius = 0;
  public ringOuterRadius = 0;
  // public name: string = '';
  public planet:THREE.Mesh = new THREE.Mesh();
  public size: number;
  public velocity: THREE.Vector2 = new THREE.Vector2(0, 0);
  public rotate: boolean = true;
  public rotationSpeed: number = 0.01;
  public rotationDir: boolean = false;
  public axialTilt: number = 0;
  public angle: number = 0;
  public orbit: number = 0;
  private orbitOffset: {
    x: number,
    y: number,
    z: number
  } = {
    x: 0, y: 0, z: 0
  };
  public orbitSpeed: number = 0;
  public showOrbit: boolean = false;
  public followOrbit: boolean = false;

  public planetTexture: string;
  private planetBump?: string;
  public color: THREE.Vector3 = new THREE.Vector3(1,1,1);
  public planetIcon?: string;
  public orbitCenter: THREE.Object3D;

  public positionHelper:THREE.Object3D | undefined;

  public moons?: Array<Planet>;

  public isStar:boolean|undefined = false;

  constructor(props: PlanetProps, orbitCenter: THREE.Object3D) {
    super();

    this.orbitCenter = orbitCenter;
    
    this.size = props.size;
    this.name = props.name;
    this.isStar = props.star;
    this.planetIcon = props.icon;
    this.planetTexture = props.texture || '';
    this.planetBump = props.bump;

    if (props.color) {
      this.color = new THREE.Vector3(
        props.color.r, props.color.g, props.color.b
      )
    }
    if (props.axialTilt) {
      this.axialTilt = degrees_to_radians(-props.axialTilt);
    }

    if (props.orbitOffset) {
      this.orbitOffset = props.orbitOffset;
      this.position.x = this.orbitOffset.x;
      this.position.y = this.orbitOffset.y;
      this.position.z = this.orbitOffset.z;
    }

    this.rotationDir = props.rotationDir || false;
    this.rotationSpeed = props.rotationSpeed / 60 / 60 / 10;

    this.orbit = props.orbit !== 0 ? props.orbit: 0;
    this.orbitSpeed = props.orbitSpeed ? props.orbitSpeed * 0.001 : 0;
    // this.angle = ((this.angle + Math.PI / 360 * this.orbitSpeed) % (Math.PI * 2)) * 10000000;
 
    if (props.moons) {
      this.addMoons(props.moons);
    }

    this.createPlanet();

    this.setPositionToOrbit(0, true);

    if (this.isStar) {
      this.addLight();
    }

    if (props.ring) {
      this.addRings(props.ring);
    }

  }

  private createPlanet() {
    this.planet.geometry = new THREE.SphereGeometry(this.size, 64, 32);
    if (this.isStar) {
      this.planet.material = new THREE.MeshBasicMaterial({
        map: this.isStar ? this.loader.load(this.planetTexture) : null, 
        color:  new THREE.Color(this.color.x, this.color.y, this.color.z),
      });
    } else {
      this.planet.material = new THREE.MeshLambertMaterial({
        map: this.loader.load(this.planetTexture),
        side: THREE.FrontSide
      });
      this.planet.castShadow = true;
      this.planet.receiveShadow = true;

      // if (this.planetBump) {
      //   const normalTexture = new THREE.TextureLoader().load(this.planetBump)
      //   this.material.normalMap = normalTexture
      //   this.material.normalScale.set(0.5, 0.5)
      // }
    }

    this.planet.rotateZ(this.axialTilt);
    this.addAtmosphere();
    this.add(this.planet);
    this.orbitCenter.add(this);
  }

  private createHelperMesh(size: any, color:any) {
    const geometry = new THREE.BoxGeometry( size.x, size.y, size.z ); 
    const material = new THREE.MeshBasicMaterial( {color: color} ); 
    const cube = new THREE.Mesh( geometry, material ); 
    return cube;
  }

  private addPositionHelper() {
    const length = this.size * 4;
    const width = this.size * .10;

    this.positionHelper = new THREE.Object3D();

    const helperX = this.createHelperMesh({x: length, y: width, z: width}, 0xff0000);
    this.positionHelper.add( helperX );
    const helperY = this.createHelperMesh({x: width, y: length, z: width}, 0x00ff00);
    this.positionHelper.add( helperY );
    const helperZ = this.createHelperMesh({x: width, y: width, z: length}, 0x0000ff);
    this.positionHelper.add( helperZ );

    this.planet.add( this.positionHelper );

  }

  private removePositionHelpers() {
    if (this.positionHelper) {
      this.planet.remove(this.positionHelper);
      this.positionHelper = undefined;
    }
  }

  public togglePositionHelper() {
    if (this.positionHelper) {
      this.removePositionHelpers();
    } else {
      this.addPositionHelper();
    }
  }

  private addMoons(moonsProps:any) {
    const self = this;
    let moons:Array<Planet> = [];
    moonsProps.forEach((_moonData: PlanetProps) => {
      const moon = new Planet(_moonData, self);
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
    this.add(atmos);

    // const lightMat = new THREE.MeshBasicMaterial({
    //   color:0x00ff00,
    //   transparent: true,
    //   opacity:0.6,
    // })
    // const lightMesh = new THREE.Mesh(this.planet.geometry, lightMat);
    // this.add(lightMesh);
  }

  public toggleShowOrbit(show: boolean) {
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
    this.showOrbit = true;
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
    this.orbitPath.position.y = this.orbitOffset.y + this.position.y -this.size - 0.001;
    this.orbitPath.position.x = this.orbitOffset.x;
    this.orbitPath.position.z = this.orbitOffset.z;
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
      this.orbitCenter.remove(this.orbitPath);
      this.showOrbit = false;
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
    
    this.position.x = this.orbitOffset.x + this.orbit * Math.cos(this.angle);
    this.position.z = this.orbitOffset.z + this.orbit * Math.sin(this.angle);
    this.position.y = this.orbitOffset.y;
 
    const speed = this.orbitSpeed * timeScale;
    this.angle = ((this.angle + Math.PI / 360 * speed) % (Math.PI * 2))
  }

  private addLight() {
    const light = new THREE.PointLight(0x504030, 3000000, 800000);
    // light.shadow = new THREE.PointLightShadow(this.parent.camera)
    light.castShadow = true;

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 2048; // default
    light.shadow.mapSize.height = 2048; // default
    light.shadow.camera.near = 0.1; // default
    light.shadow.camera.far = 100; // default
    light.shadow.radius = 10;
    this.add(light);
  }

  private addRings(props: any) {
    this.ringInnerRadius = props.texture;
    this.ringOuterRadius = props.texture;

    let ringGeo = new THREE.RingGeometry(
      props.innerRadius + 0.1,
      props.outerRadius + 0.1, 
      32, 
      1, 
      0, 
      Math.PI * 2
    );
    const mat = new THREE.MeshLambertMaterial();
    this.ringTexture = props.texture;
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
    this.add(this.ring);
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

  public changeOrbit(orbit:number) {
    this.orbit = orbit;
    if (this.showOrbit) {
      this.addOrbitPath();
    }
    this.setPositionToOrbit(0, true);
  }

  public changeOrbitSpeed(n:number) {
    this.orbitSpeed = n * 0.0001;
  }

  public setFollowOrbit(checked:boolean): void {
    this.followOrbit = checked;
  }

  public setShowOrbit(checked:boolean): void {
    this.toggleShowOrbit(checked);
  }

  public changeRotationSpeed(n:number) {
    this.rotationSpeed = n * 0.0001;
  }

  setRotationDir(dir:boolean): void {
    this.rotationDir = dir;
  }

  setRotate(r: boolean) {
    this.rotate = r
  }

  changeSize(scale:number) {
    if (!this.planet) { return }
    // this.planet.size = scale;
    // this.planet.planet.geometry.scale(scale, scale, scale);
  }

  changeOrbitAngle(angle: number) {
    this.angle = angle;
    this.setPositionToOrbit(0, true);

  }
}