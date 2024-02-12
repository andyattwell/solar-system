import { Component, Inject, AfterViewInit, EventEmitter, Output } from '@angular/core';
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
    CdkDrag
  ],
  templateUrl: './planet-dialog.component.html',
  styleUrl: './planet-dialog.component.scss',
})
export class PlanetDialogComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {}

  close(e:MouseEvent) {
    e.stopPropagation();
    this.onClose.emit();
  }
}
