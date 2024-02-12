import { Component, Inject, EventEmitter, Output } from '@angular/core';
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
import { Planet } from '../Planet';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
export class PlanetDialogComponent {
  @Output() onClose = new EventEmitter<any>();
  constructor(@Inject(MAT_DIALOG_DATA) public data: Planet) {}

  public get rotation () {
    return (this.data.rotationSpeedY * 1000).toFixed(2)
  }

  public set rotation(speed:any) {
    this.data.rotationSpeedY = speed * 0.005
  }

  public get position () {
    return {
      x: this.data.planet.position.x.toFixed(2),
      y: this.data.planet.position.y.toFixed(2),
      z: this.data.planet.position.z.toFixed(2),
    }
  }

  public get orbitSpeed() {
    return (this.data.orbitSpeed * 1000).toFixed(2)
  }

  public set orbitSpeed(speed:any) {
    this.data.orbitSpeed = speed * 0.001
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
    this.data.toggleOrbit(checked);
  }
  
  setFollowOrbit(checked:boolean): void {
    this.data.followOrbit = true;
  }

  close(e:MouseEvent) {
    e.stopPropagation();
    this.onClose.emit();
  }
}
