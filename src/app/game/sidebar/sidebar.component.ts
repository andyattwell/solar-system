import { Component, Input, Output, AfterViewInit, EventEmitter, Inject } from '@angular/core';
import { Planet } from "../Planet";
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() public planets: Array<Planet> = [];
  @Output() selectEvent = new EventEmitter<any>();

  selectedOpt = '';

  selectPlanet(event:MouseEvent, planet: Planet) {
    event.preventDefault();
    this.selectEvent.emit(planet);
    this.selectedOpt = planet.name
  }
}
