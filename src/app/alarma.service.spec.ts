import { TestBed } from '@angular/core/testing';

import { AlarmaService } from './alarma.service';

describe('AlarmaService', () => {
  let service: AlarmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlarmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
