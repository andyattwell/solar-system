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
  @Output() selectEvent = new EventEmitter<any>();

  selectedOpt = '';
  orbitEnabled = false;
  rotationEnabled = true;

  selectPlanet(event:MouseEvent, planet: Planet) {
    event.preventDefault();
    this.selectEvent.emit(planet);
    this.selectedOpt = planet.name
  }

  toggleOrbit(enabled: boolean) {
    this.orbitEnabled = enabled
    this.planets.forEach(p => {
      p.followOrbit = enabled
    })
  }

  toggleRotation(enabled: boolean) {
    this.rotationEnabled = enabled
    this.planets.forEach(p => {
      p.rotate = enabled
    })
  }
}
