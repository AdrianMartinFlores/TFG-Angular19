import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlarmaService {
  constructor(private http: HttpClient) {}

  getAlarmas(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://79.147.185.171/TFG/Backend/Alarma.php?usuario_id=${usuario_id}`);
  }

  getAlarmasProximas(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://79.147.185.171/TFG/Backend/Alarma.php?usuario_id=${usuario_id}&proximas=1`);
  }

  programarAlarma(usuario_id: number, fecha_hora: string, dias_repetir: string): Observable<any> {
    return this.http.post('http://79.147.185.171/TFG/Backend/Alarma.php', {
      usuario_id,
      fecha_hora,
      dias_repetir
    });
  }

  eliminarAlarma(id: number): Observable<any> {
    return this.http.request('delete', 'http://79.147.185.171/TFG/Backend/Alarma.php', {
      body: { id }
    });
  }

  editarAlarma(id: number, fecha_hora: string, usuario_id: number) {
    return this.http.put('http://79.147.185.171/TFG/Backend/Alarma.php', { id, fecha_hora, usuario_id });
  }
}
