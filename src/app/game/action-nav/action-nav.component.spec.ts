import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionNavComponent } from './action-nav.component';

describe('ActionNavComponent', () => {
  let component: ActionNavComponent;
  let fixture: ComponentFixture<ActionNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActionNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
