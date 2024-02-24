import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Planet } from "../../../classes/Planet";
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-planet-selector',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatCheckboxModule, MatIconModule],
  templateUrl: './planet-selector.component.html',
  styleUrl: './planet-selector.component.scss'
})
export class PlanetSelectorComponent {

  @Input() public planets: Array<Planet> = [];

  public showOrbit: boolean = false;

  @Input() public followOrbit: boolean = false;
  @Input() public rotationEnabled: boolean = false;
  @Output() selectEvent = new EventEmitter<any>();
  @Output() orbitShowEvent = new EventEmitter<any>();
  @Output() orbitEvent = new EventEmitter<any>();
  @Output() rotationEvent = new EventEmitter<any>();

  selectedOpt = '' ;

  selectPlanet(event:MouseEvent, planet?: Planet) {
    event.preventDefault();
    this.selectEvent.emit(planet);
    this.selectedOpt = planet?.name || ''
  }

  toggleFollowOrbit() {
    this.orbitEvent.emit();
  }

  toggleRotation() {
    this.rotationEvent.emit();
  }

  toggleShowOrbit() {
    this.showOrbit = !this.showOrbit;
    this.orbitShowEvent.emit(this.showOrbit);
  }
}
