import * as THREE from 'three';
import { Planet } from '../classes/Planet';

export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const SHIFT = 'shift'
export const DIRECTIONS = [W, A, S, D]

export function get2dPosition(object: THREE.Mesh, camera:THREE.Camera, width:number, height:number) {
  var widthHalf = width / 2, heightHalf = height / 2;
  
  var pos = object.position.clone();
  pos.project(camera);
  pos.x = ( pos.x * widthHalf ) + widthHalf;
  pos.y = - ( pos.y * heightHalf ) + heightHalf;
  pos.z = - ( pos.z * heightHalf ) + heightHalf;
  return pos;
}



function distance(position0: THREE.Vector3, position1: THREE.Vector3) {
  let d1 = Math.abs(position1.x - position0.x);
  let d2 = Math.abs(position1.y - position0.y);
  let d3 = Math.abs(position1.z - position0.z);
  return d1 + d2 + d3;
}


function degrees_to_radians(degrees:number):number {
  var pi = Math.PI;
  return degrees * (pi/180);
}

function accelerate_due_to_gravity(first: Planet, second: Planet) {
  
  const force = first.mass * second.mass / distance(first.position, second.position) * 2
  const angle = first.position.angleTo(second.position)
  let reverse = 1
  let arr = []
  arr.push(first);
  arr.push(second);
  arr.forEach((body: any) => {
    const acceleration = force / body.mass
    const acc_x = acceleration * Math.cos(degrees_to_radians(angle))
    const acc_y = acceleration * Math.sin(degrees_to_radians(angle))
    body.velocity = new THREE.Vector2(
      body.velocity.x + (reverse * acc_x),
      body.velocity.y + (reverse * acc_y),
    )
    reverse = -1
  });
  console.log(second.name, second.position.x , second.position.y)

  second.position.x = second.position.x + second.velocity.x
  second.position.y = second.position.y + second.velocity.y
}

export default {
  get2dPosition,
  accelerate_due_to_gravity
}