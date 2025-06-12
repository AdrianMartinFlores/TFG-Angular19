import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrupoTareasService {
  constructor(private http: HttpClient) {}

  getGrupos(usuario_id: number): Observable<any[]> {
    return this.http.get<any[]>(`http://79.147.185.171/TFG/Backend/GruposTareas.php?usuario_id=${usuario_id}`);
  }

  crearGrupo(nombre: string, usuario_id: number): Observable<any> {
    return this.http.post('http://79.147.185.171/TFG/Backend/GruposTareas.php', { nombre, usuario_id });
  }

  editarGrupo(id: number, nombre: string, usuario_id: number): Observable<any> {
    return this.http.put('http://79.147.185.171/TFG/Backend/GruposTareas.php', { id, nombre, usuario_id });
  }

  eliminarGrupo(id: number, usuario_id: number): Observable<any> {
    return this.http.request('DELETE', 'http://79.147.185.171/TFG/Backend/GruposTareas.php', { body: { id, usuario_id } });
  }
}
