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
export class SidebarComponent implements AfterViewInit {

  @Input() public planets: Array<Planet> = [];
  @Output() selectEvent = new EventEmitter<any>();

  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
    console.log({planets: this.planets})
  }

  selectPlanet(event:MouseEvent, planet: Planet) {
    event.preventDefault();
    this.selectEvent.emit(planet);    
  }
}
