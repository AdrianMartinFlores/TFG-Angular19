import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-control-de-jornada',
  templateUrl: './control-de-jornada.component.html',
  styleUrls: ['./control-de-jornada.component.css'],
  standalone: true,
  imports: [FormsModule, NavComponent, CommonModule] 
})
export class ControlDeJornadaComponent implements OnInit {
  registros: any[] = [];
  registroSeleccionado: any = { id: null, fecha: '', horaEntrada: '', horaSalida: '' };
  mensaje: string = '';
  usuario_id: number = 0;
  actividades: any[] = [];
  tiempoTranscurrido: number = 0; // en segundos
  temporizador: any = null;
  temporizadorActivo: boolean = false;
  modoRegistro: string = 'manual';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      this.usuario_id = parseInt(usuarioId, 10);
      this.cargarRegistros();
      this.cargarActividades();
    }
  }

  cargarRegistros() {
    this.http.get<any[]>(`http://localhost/TFG/Backend/Jornada.php?usuario_id=${this.usuario_id}`)
      .subscribe({
        next: (data) => this.registros = data,
        error: () => this.mensaje = 'Error al cargar los registros'
      });
  }

  cargarActividades() {
    this.http.get<any[]>(`http://localhost/TFG/Backend/Actividades.php?usuario_id=${this.usuario_id}`)
      .subscribe({
        next: (data) => this.actividades = data,
        error: () => this.mensaje = 'Error al cargar actividades'
      });
  }

  iniciarTemporizador() {
    this.temporizadorActivo = true;
    this.tiempoTranscurrido = 0;
    this.temporizador = setInterval(() => {
      this.tiempoTranscurrido++;
    }, 1000);
  }

  detenerTemporizador() {
    this.temporizadorActivo = false;
    clearInterval(this.temporizador);
  }

  resetearTemporizador() {
    this.temporizadorActivo = false;
    clearInterval(this.temporizador);
    this.tiempoTranscurrido = 0;
  }

  registrarJornada(event: Event) {
    event.preventDefault();
    let body: any = { ...this.registroSeleccionado, usuario_id: this.usuario_id };

    if (this.modoRegistro === 'temporizador') {
      body.duracion = this.tiempoTranscurrido;
      body.horaEntrada = null;
      body.horaSalida = null;
    }

    const url = 'http://localhost/TFG/Backend/Jornada.php';

    if (this.registroSeleccionado.id) {
      // Actualizar
      this.http.put(url, body).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.mensaje = 'Registro actualizado correctamente';
            this.cargarRegistros();
            this.registroSeleccionado = { id: null, fecha: '', horaEntrada: '', horaSalida: '' };
          }
        },
        error: () => this.mensaje = 'Error al actualizar el registro'
      });
    } else {
      this.http.post(url, body).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.mensaje = 'Registro creado correctamente';
            this.cargarRegistros();
            this.registroSeleccionado = { id: null, fecha: '', horaEntrada: '', horaSalida: '' };
          }
        },
        error: () => this.mensaje = 'Error al crear el registro'
      });
    }
    setTimeout(() => this.mensaje = '', 2000);
  }

  editarRegistro(registro: any) {
    this.registroSeleccionado = { ...registro };
  }

  eliminarRegistro(id: number) {
    const url = 'http://localhost/TFG/Backend/Jornada.php';
    this.http.request('DELETE', url, { body: { id } }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mensaje = 'Registro eliminado correctamente';
          this.cargarRegistros();
        }
      },
      error: () => this.mensaje = 'Error al eliminar el registro'
    });
    setTimeout(() => this.mensaje = '', 2000);
  }
}
