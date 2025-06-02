import { TestBed } from '@angular/core/testing';

import { GrupoTareasService } from './grupo-tareas.service';

describe('GrupoTareasService', () => {
  let service: GrupoTareasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrupoTareasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
