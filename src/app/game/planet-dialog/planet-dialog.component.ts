import { Component, Inject, AfterViewInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import {MatSliderModule} from '@angular/material/slider';

import { Planet } from '../Planet';
export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}
@Component({
  selector: 'app-planet-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatListModule, MatSliderModule],
  templateUrl: './planet-dialog.component.html',
  styleUrl: './planet-dialog.component.scss',
})
export class PlanetDialogComponent implements AfterViewInit {
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
}
