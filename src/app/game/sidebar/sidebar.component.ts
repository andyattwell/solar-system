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

  // @Input('planet') public planet: Planet | undefined;
  private _planet:Planet|undefined;
  @Input() set planet(value: Planet) {
    this._planet = value
    if (this.selectedTabIndex === 0) {
      this.setPlanetPreview();
    }
  }
   
  get planet(): Planet|undefined {
    return this._planet;
  }

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

  close(e:MouseEvent) {
    e.stopPropagation();
    this.closeEvent.emit();
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
    if (!this.planet) { return; }
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
