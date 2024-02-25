import { Component, Inject, EventEmitter, Output, AfterViewInit, Input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Planet } from '../../../classes/Planet';
import { ValueControlComponent } from './value-control/value-control.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ValueControlComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input('planet') public planet: Planet | undefined;
  @Output() closeEvent = new EventEmitter<any>();

  orbitMultiplyer: number = 1;
  originalOrbit: number = 0;

  constructor() {}

  ngAfterViewInit(): void {
    if (this.planet) {
      this.originalOrbit = this.planet.orbit
    }
  }

  public get rotation () {
    if (this.planet) {
      return (this.planet.rotationSpeed * 1000)
    }
    return 0;
  }

  public changeRotationSpeed(n:number) {
    if (!this.planet) { return }
    console.log('changeRotationSpeed', n)
    this.planet.rotationSpeed = n * 0.0001;
  }

  public get rotationDir () {
    return this.planet ? this.planet.rotationDir : false
  }

  public set rotationDir(dir:boolean) {
    if (this.planet) {
      this.planet.rotationDir = dir
    }
  }

  public get positionHelperEnable() {
    return this.planet ? this.planet.positionHelper : false;
  }

  public get position () {
    if (this.planet) {
      return {
        x: this.planet.container?.position.x.toFixed(2),
        y: this.planet.container?.position.y.toFixed(2),
        z: this.planet.container?.position.z.toFixed(2),
      }
    }
    return {
      x:0, y:0, z:0
    }
  }

  public get orbitSpeed() {
    return this.planet ? (this.planet.orbitSpeed * 1000) : 0
  }

  public changeOrbitSpeed(n:number) {
    if (this.planet) {
      this.planet.orbitSpeed = n * 0.0001;
    }
  }

  public get orbit() {
    return this.planet ? this.planet.orbit : 0
  }

  public changeOrbit(n:number) {
    if (this.planet) {
      this.planet.changeOrbit(n);
    }
  }

  public get showOrbit() {
    return this.planet ? this.planet.showOrbit : false
  }
  
  public set showOrbit(show:any) {
    if (this.planet) {
      this.planet.showOrbit = show
    }
  }

  public get followOrbit() {
    return this.planet ? this.planet.followOrbit : 0
  }
  
  public set followOrbit(show:any) {
    if (this.planet) {
      this.planet.followOrbit = show
    }
  }

  setShowOrbit(checked:boolean): void {
    if (this.planet) {
      this.planet.toggleShowOrbit(checked);
    }
  }
  
  setFollowOrbit(checked:boolean): void {
    if (this.planet) {
      this.planet.followOrbit = checked;
    }
  }

  setRotationDir(dir:boolean): void {
    if (this.planet) {
      this.planet.rotationDir = dir;
    }
  }

  setRotate(r: boolean) {
    if (this.planet) {
      this.planet.rotate = r
    }
  }

  close(e:MouseEvent) {
    e.stopPropagation();
    this.closeEvent.emit();
  }

  togglePositionHelper(show:Boolean) {
    if (this.planet) {
      this.planet.togglePositionHelper();
    }
  }
}
