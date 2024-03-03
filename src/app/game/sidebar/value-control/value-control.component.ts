import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-value-control',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './value-control.component.html',
  styleUrl: './value-control.component.scss'
})
export class ValueControlComponent implements AfterViewInit{

  @Input('label') public label: string = '';
  @Input('value') public value?: number;
  @Input('step') public step: number = 1;

  @Output() public change = new EventEmitter<any>();

  multipliyer = 1;
  originalValue:number = 0;

  ngAfterViewInit(): void {
    this.originalValue = this.value || 0;
  }

  public changeValue(n:number) {
    if (this.value !== undefined) {
      this.multipliyer += n;
      console.log(this.multipliyer, this.originalValue, this.step)

      this.change.emit(this.originalValue + this.step * this.multipliyer)
    }
  }
  public resetValue() {
    if (this.value !== undefined) {
      this.multipliyer = 1;
      this.change.emit(this.originalValue + this.step * this.multipliyer)
    }
  }

}
