import { Component, Output, Input, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-action-nav',
  standalone: true,
  imports: [MatButtonModule, MatIconModule,MatDividerModule],
  templateUrl: './action-nav.component.html',
  styleUrl: './action-nav.component.scss'
})
export class ActionNavComponent {
  @Input('timeScale') public timeScale: number = 1;
  @Input('playing') public playing: boolean = false;
  @Input('selectedCamera') public selectedCamera: string|undefined;
  @Output() pauseEvent = new EventEmitter<any>();
  @Output() playEvent = new EventEmitter<any>();
  @Output() timeEvent = new EventEmitter<any>();
  @Output() cameraEvent = new EventEmitter<any>();
  
  @Output() forwardEvent = new EventEmitter<any>();
  @Output() rewindEvent = new EventEmitter<any>();

  steps = [-100 , -10, -1, -0.1, 0, 0.1, 1, 10, 100];
  currentStepIndex = 6;
  currentStep = this.steps[this.currentStepIndex]

  cameras: Array<any> = [{
    name: 'system',
    label: 'System view',
    icon: 'my_location'
  },{
    name: 'free',
    label: 'Free roam',
    icon: 'view_in_ar'
  },{
    name: 'player',
    label: 'Player view',
    icon: 'person'
  }]

  play () {
    this.playEvent.emit()
  }

  pause () {
    this.pauseEvent.emit()
  }

  fastForward() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.currentStep = this.steps[this.currentStepIndex];
      this.timeEvent.emit(this.currentStep);
    }
  }

  rewindGame() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.currentStep = this.steps[this.currentStepIndex];
      this.timeEvent.emit(this.currentStep);
    }
  }

  changeCamera(cameraType: string) {
    this.cameraEvent.emit(cameraType)
  }

  isSelected(cameraName: string) {
    return this.selectedCamera === cameraName ? 'primary' : ''
  }
}
