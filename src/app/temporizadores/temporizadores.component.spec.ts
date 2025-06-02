import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporizadoresComponent } from './temporizadores.component';

describe('TemporizadoresComponent', () => {
  let component: TemporizadoresComponent;
  let fixture: ComponentFixture<TemporizadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemporizadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemporizadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
