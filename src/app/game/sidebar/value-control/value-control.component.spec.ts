import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueControlComponent } from './value-control.component';

describe('ValueControlComponent', () => {
  let component: ValueControlComponent;
  let fixture: ComponentFixture<ValueControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValueControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
