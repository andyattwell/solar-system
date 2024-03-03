import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Planet } from '../../../classes/Planet';
import { ValueControlComponent } from './value-control/value-control.component';
import { PreviewComponent } from './preview/preview.component';
import { Player } from '../../../classes/Player';
import * as THREE from 'three';

interface Preview {
  model: THREE.Object3D,
  size: number,
  rotate: boolean,
  dir: boolean,
  rotationSpeed: number,
  type: string,
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatTabsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ValueControlComponent,
    PreviewComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements AfterViewInit {

  @Input('planet') public planet: Planet | undefined;
  @Input('player') public player: Player | null = null;
  @Input('timeScale') public timeScale = 1;
  @Output() closeEvent = new EventEmitter<any>();

  selectedTabIndex = 1
  previewData:Preview|undefined;
  tabs = ['planet', 'player'];

  ngAfterViewInit(): void {
    
    this.selectedTabIndex = 1;
    const self = this;
    setTimeout(() => {
      self.setPlayerPreview();
    }, 10)
  }

  public changeRotationSpeed(n:number) {
    if (!this.planet) { return }
    this.planet.rotationSpeed = n * 0.0001;
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

  setShowOrbit(checked:boolean): void {
    if (this.planet) {
      this.planet.toggleShowOrbit(checked);
    }
  }
  
  public get followOrbit() {
    return this.planet ? this.planet.followOrbit : 0
  }

  setFollowOrbit(checked:boolean): void {
    if (this.planet) {
      this.planet.followOrbit = checked;
    }
  }

  public get rotationDir () {
    return this.planet ? this.planet.rotationDir : false
  }

  setRotationDir(dir:boolean): void {
    if (this.planet) {
      this.planet.rotationDir = dir;
    }
  }

  public get rotation () {
    if (this.planet) {
      return (this.planet.rotationSpeed * 1000)
    }
    return 0;
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

  changeSize(scale:number) {
    if (!this.planet) { return }
    // this.planet.size = scale;
    // this.planet.planet.geometry.scale(scale, scale, scale);
  }

  changePlayerRotation(rotation:number) {
    this.player?.rotateY(rotation);
  }

  onTabChanged($event:any) {
    this.selectedTabIndex = $event.index;
    this.previewData = undefined;

    const self = this;
    setTimeout(() => {
      if (self.tabs[self.selectedTabIndex] === 'planet' && self.planet) {
        self.setPlanetPreview();
      } else if (self.tabs[self.selectedTabIndex] === 'player') {
        self.setPlayerPreview()
      }
    }, 1)
  }
  setPlanetPreview() {
    if (!this.planet) {
      return;
    }
    this.previewData = {
      model: this.planet.planet,
      size: this.planet.size,
      rotate: this.planet.rotate,
      dir: this.planet.rotationDir,
      rotationSpeed: this.planet.rotationSpeed,
      type: 'planet',
    }
  }

  setPlayerPreview() {
    if (!this.player) {
      return;
    }
    this.previewData = {
      model: this.player.mesh,
      size: this.player.size,
      rotate: true,
      dir: false,
      rotationSpeed: 0.01,
      type: 'player',
    } 
  }


}
