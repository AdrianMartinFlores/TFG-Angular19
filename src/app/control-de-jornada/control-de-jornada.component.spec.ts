import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlDeJornadaComponent } from './control-de-jornada.component';

describe('ControlDeJornadaComponent', () => {
  let component: ControlDeJornadaComponent;
  let fixture: ComponentFixture<ControlDeJornadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlDeJornadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlDeJornadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
