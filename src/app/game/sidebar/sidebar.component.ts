import { Component, Input, Output, AfterViewInit, EventEmitter, Inject } from '@angular/core';
import { Planet } from "../Planet";
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() public planets: Array<Planet> = [];
  @Input() public showOrbit: boolean = false;
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

  toggleOrbit(enabled: boolean) {
    this.orbitEvent.emit(enabled);
  }

  toggleRotation(enabled: boolean) {
    this.rotationEvent.emit(enabled);
  }

  toggleShowOrbit(enabled: boolean) {
    this.orbitShowEvent.emit(enabled);
  }
}
