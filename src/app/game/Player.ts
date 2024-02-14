import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Player {
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private renderer: THREE.Renderer;
  private controls: OrbitControls;
  private mesh: THREE.Mesh;
  private goal: THREE.Object3D;
  private keys: any;
  private follow: THREE.Object3D;;

  private time:number = 0;
  private newPosition:THREE.Vector3 = new THREE.Vector3();
  private matrix:THREE.Matrix4 = new THREE.Matrix4();

  private stop:number = 1;
  private DEGTORAD:number = 0.01745327;
  private temp:THREE.Vector3 = new THREE.Vector3;
  private dir:THREE.Vector3 = new THREE.Vector3;
  private a:THREE.Vector3 = new THREE.Vector3;
  private b:THREE.Vector3 = new THREE.Vector3;
  private coronaSafetyDistance:number = 0.1;
  private velocity:number = 0.0;
  private speed:number = 0.0;
  private moving: boolean = false;

  constructor(
    camera: THREE.Camera,
    scene: THREE.Scene,
    renderer: THREE.Renderer,
    controls: OrbitControls
  ) {
    this.camera = camera,
    this.scene = scene,
    this.renderer = renderer,
    this.controls = controls

    this.camera.position.set( 10, 10, 10 );
    // this.camera.lookAt( this.scene.position );

    var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    var material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.set(2000, 0, 2000 )
    this.goal = new THREE.Object3D;
    this.follow = new THREE.Object3D;
    this.follow.position.z = -this.coronaSafetyDistance;
    this.mesh.add( this.follow );

    this.goal.add( this.camera );
    this.scene.add( this.mesh );

    // Helpers
    const gridHelper = new THREE.GridHelper( 100, 100 );
    this.scene.add( gridHelper );
    this.scene.add( new THREE.AxesHelper() );

    this.keys = {
      a: false,
      s: false,
      d: false,
      w: false
    };

    this.init();
    this.animate();
  }

  private init() {
    this.camera.lookAt( this.mesh.position );
    this.controls.target = this.mesh.position
    this.controls.update()

    const self = this;
    document.body.addEventListener( 'keydown', function(e) {
      const key = e.code.replace('Key', '').toLowerCase();
      if ( self.keys[ key ] !== undefined )
      self.keys[ key ] = true;
      self.moving = true;
    });

    document.body.addEventListener( 'keyup', function(e) {
      const key = e.code.replace('Key', '').toLowerCase();
      if ( self.keys[ key ] !== undefined )
        self.keys[ key ] = false;
        self.moving = false;
    });

  }


  public animate() {
    
    if (!this.moving) {
      return
    }

    this.speed = 0.0;
    
    if ( this.keys.w )
    this.speed = 0.01;
    else if ( this.keys.s )
    this.speed = -0.01;

    this.velocity += ( this.speed - this.velocity ) * .3;
    this.mesh.translateZ( this.velocity );

    if ( this.keys.a )
      this.mesh.rotateY(0.05);
    else if ( this.keys.d )
      this.mesh.rotateY(-0.05);
      
    
    this.a.lerp(this.mesh.position, 0.4);
    this.b.copy(this.goal.position);
    
    this.dir.copy( this.a ).sub( this.b ).normalize();
    const dis = this.a.distanceTo( this.b ) - this.coronaSafetyDistance;
    this.goal.position.addScaledVector( this.dir, dis );
    this.goal.position.lerp(this.temp, 0.02);
    this.temp.setFromMatrixPosition(this.follow.matrixWorld);
    this.camera.lookAt( this.mesh.position );
    // this.controls.target = this.mesh.position
    // this.controls.update()
  }
}