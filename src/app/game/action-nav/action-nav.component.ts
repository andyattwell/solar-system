import { Component, Output, Input, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-action-nav',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './action-nav.component.html',
  styleUrl: './action-nav.component.scss'
})
export class ActionNavComponent {
  @Input('timeScale') public timeScale: number = 1;
  @Input('playing') public playing: boolean = false;
  @Output() pauseEvent = new EventEmitter<any>();
  @Output() playEvent = new EventEmitter<any>();
  @Output() timeEvent = new EventEmitter<any>();
  
  @Output() forwardEvent = new EventEmitter<any>();
  @Output() rewindEvent = new EventEmitter<any>();

  play () {
    this.playEvent.emit()
  }

  pause () {
    this.pauseEvent.emit()
  }

  fastForward() {
    let tS = this.timeScale;
    if (tS === 0) {
      tS = 1;
    } else if (tS === -1) {
      tS = 0;
    } else if (tS === -10) {
      tS = -1;
    } else if (tS > 0 && tS < 10) {
      tS = 10;
    } else {
      tS += 10
    }
    this.timeEvent.emit(tS);
  }

  rewindGame() {
    let tS = this.timeScale;
    console.log({tS})
    if (tS === 0) {
      tS = -1;
    } else if (tS === 1) {
      tS = 0;
    } else if (tS === 10) {
      tS = 1;
    } else if (tS < 0 && tS > -10) {
      tS = -10;
    } else {
      tS -= 10
    }
    this.timeEvent.emit(tS);
  }
}
