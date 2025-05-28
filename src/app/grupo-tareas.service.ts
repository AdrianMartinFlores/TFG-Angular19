import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrupoTareasService {
  constructor(private http: HttpClient) {}

  getGrupos(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost/TFG/TfgAngular19/Backend/GruposTareas.php?usuario_id=${usuario_id}`);
  }

  crearGrupo(nombre: string, usuario_id: number): Observable<any> {
    return this.http.post('http://localhost/TFG/TfgAngular19/Backend/GruposTareas.php', { nombre, usuario_id });
  }

  editarGrupo(id: number, nombre: string): Observable<any> {
    return this.http.put('http://localhost/TFG/TfgAngular19/Backend/GruposTareas.php', { id, nombre });
  }

  eliminarGrupo(id: number): Observable<any> {
    return this.http.request('DELETE', 'http://localhost/TFG/TfgAngular19/Backend/GruposTareas.php', { body: { id } });
  }
}
