import { Component, Inject, EventEmitter, Output, AfterViewInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Planet } from '../../../classes/Planet';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-planet-dialog',
  standalone: true,
  imports: [
    MatDialogTitle, 
    MatDialogContent,
    MatDialogActions,
    MatListModule, 
    MatSliderModule, 
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    CdkDrag
  ],
  templateUrl: './planet-dialog.component.html',
  styleUrl: './planet-dialog.component.scss',
})
export class PlanetDialogComponent implements AfterViewInit {
  @Output() onClose = new EventEmitter<any>();
  public rotationMultiplyer = 1;
  private originalRotationSpeed = 0;
  orbitSpeedMultiplyer: number = 1;
  originalOrbitSpeed: number = 0;
  orbitMultiplyer: number = 1;
  originalOrbit: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Planet) {}
  ngAfterViewInit(): void {
    this.originalRotationSpeed = this.data.rotationSpeed
    this.originalOrbitSpeed = this.data.orbitSpeed
    this.originalOrbit = this.data.orbit
  }

  public get rotatationEnable () {
    return this.data.rotate;
  }

  public set rotatationEnable(r:boolean) {
    this.data.rotate = r
  }

  public get rotation () {
    return (this.data.rotationSpeed * 1000).toFixed(2)
  }

  public changeRotationSpeed(n:number) {
    this.rotationMultiplyer += n;
    this.data.rotationSpeed = this.originalRotationSpeed * this.rotationMultiplyer 
  }

  public resetRotationSpeed() {
    this.rotationMultiplyer = 1;
    this.data.rotationSpeed = this.originalRotationSpeed;
  }

  public get rotationDir () {
    return this.data.rotationDir
  }

  public set rotationDir(dir:boolean) {
    this.data.rotationDir = dir
  }

  public get positionHelperEnable() {
    return this.data.positionHelper
  }

  public get position () {
    return {
      x: this.data.position.x.toFixed(2),
      y: this.data.position.y.toFixed(2),
      z: this.data.position.z.toFixed(2),
    }
  }

  public get orbitSpeed() {
    return (this.data.orbitSpeed * 1000).toFixed(2)
  }

  public changeOrbitSpeed(n:number) {
    this.orbitSpeedMultiplyer += n;
    this.data.orbitSpeed = this.originalOrbitSpeed * this.orbitSpeedMultiplyer 
  }

  public resetOrbitSpeed() {
    this.orbitSpeedMultiplyer = 1;
    this.data.orbitSpeed = this.originalOrbitSpeed;
  }

  public get orbit() {
    return this.data.orbit.toFixed(2)
  }

  public changeOrbit(n:number) {
    this.orbitMultiplyer += n ;
    this.data.changeOrbit(this.data.orbit + n * .1 );
  }

  public resetOrbit() {
    this.orbitMultiplyer = 1;
    this.data.changeOrbit(this.originalOrbit);
  }

  public get showOrbit() {
    return this.data.showOrbit
  }
  
  public set showOrbit(show:any) {
    this.data.showOrbit = show
  }

  public get followOrbit() {
    return this.data.followOrbit
  }
  
  public set followOrbit(show:any) {
    this.data.followOrbit = show
  }

  setShowOrbit(checked:boolean): void {
    this.data.toggleShowOrbit(checked);
  }
  
  setFollowOrbit(checked:boolean): void {
    this.data.followOrbit = checked;
  }

  setRotationDir(dir:boolean): void {
    this.data.rotationDir = dir;
  }

  setRotate(r: boolean) {
    this.data.rotate = true
  }

  close(e:MouseEvent) {
    e.stopPropagation();
    this.onClose.emit();
  }

  togglePositionHelper(show:Boolean) {
    this.data.togglePositionHelper();
  }
}
