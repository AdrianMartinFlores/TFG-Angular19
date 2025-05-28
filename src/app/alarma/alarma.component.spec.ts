import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmaComponent } from './alarma.component';

describe('AlarmaComponent', () => {
  let component: AlarmaComponent;
  let fixture: ComponentFixture<AlarmaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlarmaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlarmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
