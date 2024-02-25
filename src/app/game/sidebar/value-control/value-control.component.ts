import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-value-control',
  standalone: true,
  imports: [],
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
