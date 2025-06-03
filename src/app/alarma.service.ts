import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlarmaService {
  constructor(private http: HttpClient) {}

  getAlarmas(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost/TFG/Backend/Alarma.php?usuario_id=${usuario_id}`);
  }

  getAlarmasProximas(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost/TFG/Backend/Alarma.php?usuario_id=${usuario_id}&proximas=1`);
  }

  programarAlarma(usuario_id: number, fechaHora: string): Observable<any> {
    return this.http.post('http://localhost/TFG/Backend/Alarma.php', {
      usuario_id,
      fecha_hora: fechaHora
    });
  }

  eliminarAlarma(id: number): Observable<any> {
    return this.http.request('delete', 'http://localhost/TFG/Backend/Alarma.php', {
      body: { id }
    });
  }

  editarAlarma(id: number, fechaHora: string): Observable<any> {
    return this.http.put('http://localhost/TFG/Backend/Alarma.php', {
      id,
      fecha_hora: fechaHora
    });
  }
}
