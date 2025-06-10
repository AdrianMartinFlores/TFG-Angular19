import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
  tiempoTranscurrido: number = 0;
  temporizador: any = null;
  temporizadorActivo: boolean = false;
  inicioTemporizador: number | null = null;
  modoRegistro: string = 'manual';
  nuevaActividad: string = '';

  actividadEditandoId: number | null = null;
  nuevoNombreActividadEditando: string = '';

  actividadTemporizadorId: number | null = null;
  actividadTiempoTranscurrido: number = 0;
  actividadTemporizador: any = null;
  actividadTemporizadorActivo: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // <-- Añade esto
  ) {}

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

  // --- TEMPORIZADOR ---
  iniciarTemporizador() {
    if (this.temporizadorActivo) return;
    this.temporizadorActivo = true;
    this.inicioTemporizador = Date.now();
    this.tiempoTranscurrido = 0;

    if (this.temporizador) clearInterval(this.temporizador);

    this.temporizador = setInterval(() => {
      if (this.inicioTemporizador !== null) {
        this.ngZone.run(() => {
          this.tiempoTranscurrido = Math.floor((Date.now() - this.inicioTemporizador!) / 1000);
        });
      }
    }, 1000);
  }

  detenerYRegistrarTemporizador() {
    this.temporizadorActivo = false;
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
    this.registrarTiempoActividad();
  }

  resetearTemporizador() {
    this.temporizadorActivo = false;
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
    this.tiempoTranscurrido = 0;
    this.inicioTemporizador = null;
  }

  registrarTiempoActividad() {
    if (!this.registroSeleccionado.actividad_id || !this.tiempoTranscurrido) return;
    const url = 'http://localhost/TFG/Backend/Jornada.php';
    const body = {
      usuario_id: this.usuario_id,
      fecha: this.registroSeleccionado.fecha || new Date().toISOString().slice(0, 10),
      actividad_id: this.registroSeleccionado.actividad_id,
      duracion: this.tiempoTranscurrido
    };
    this.http.post(url, body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mensaje = 'Tiempo registrado correctamente';
          this.cargarRegistros();
          this.resetearTemporizador();
        }
      },
      error: () => this.mensaje = 'Error al registrar el tiempo'
    });
  }

  // --- REGISTRO MANUAL ---
  registrarJornada(event: Event) {
    event.preventDefault();
    let body: any = { ...this.registroSeleccionado, usuario_id: this.usuario_id };

    if (this.modoRegistro === 'manual') {
      if (body.horaEntrada && body.horaSalida) {
        const [h1, m1] = body.horaEntrada.split(':').map(Number);
        const [h2, m2] = body.horaSalida.split(':').map(Number);
        let entrada = h1 * 3600 + m1 * 60;
        let salida = h2 * 3600 + m2 * 60;
        let duracion = salida - entrada;
        if (duracion < 0) duracion += 24 * 3600; // por si pasa de medianoche
        body.duracion = duracion;
      } else {
        body.duracion = 0;
      }
    } else if (this.modoRegistro === 'temporizador') {
      body.duracion = this.tiempoTranscurrido;
    }

    const url = 'http://localhost/TFG/Backend/Jornada.php';

    if (this.registroSeleccionado.id) {
      // Actualizar
      this.http.put(url, body).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.mensaje = 'Registro actualizado correctamente';
            this.cargarRegistros();
          }
        },
        error: () => this.mensaje = 'Error al actualizar el registro'
      });
    } else {
      // Crear nuevo registro
      this.http.post(url, body).subscribe({
        next: (res: any) => {
          if (res.success && res.id) {
            this.mensaje = 'Registro creado correctamente';
            this.cargarRegistros();
            this.registroSeleccionado.id = res.id;
          }
        },
        error: () => this.mensaje = 'Error al crear el registro'
      });
    }
    setTimeout(() => this.mensaje = '', 2000);
    this.resetearTemporizador();
  }

  editarRegistro(registro: any) {
    this.registroSeleccionado = { ...registro };
    if (registro.duracion) {
      this.tiempoTranscurrido = registro.duracion;
    }
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

  crearActividad() {
    if (!this.nuevaActividad.trim()) return;
    this.http.post('http://localhost/TFG/Backend/Actividades.php', {
      nombre: this.nuevaActividad,
      usuario_id: this.usuario_id,
      fecha_creacion: new Date().toISOString().slice(0, 10)
    }).subscribe(() => {
      this.cargarActividades();
      this.nuevaActividad = '';
    });
  }

  editarActividad(actividad: any) {
    this.actividadEditandoId = actividad.id;
    this.nuevoNombreActividadEditando = actividad.nombre;
  }

  guardarEdicionActividad(actividad: any) {
    if (!this.nuevoNombreActividadEditando.trim()) return;
    const url = 'http://localhost/TFG/Backend/Actividades.php';
    const body = { id: actividad.id, nombre: this.nuevoNombreActividadEditando, usuario_id: this.usuario_id };
    this.http.put(url, body).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Actualiza solo el nombre en el array, no agregues una nueva
          actividad.nombre = this.nuevoNombreActividadEditando;
          this.actividadEditandoId = null;
          this.nuevoNombreActividadEditando = '';
        }
      }
    });
  }

  cancelarEdicionActividad() {
    this.actividadEditandoId = null;
    this.nuevoNombreActividadEditando = '';
  }

  eliminarActividad(id: number) {
    if (!confirm('¿Seguro que quieres eliminar esta actividad?')) return;
    const url = 'http://localhost/TFG/Backend/Actividades.php';
    this.http.request('DELETE', url, { body: { id, usuario_id: this.usuario_id } }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.actividades = this.actividades.filter(a => a.id !== id);
          if (this.registroSeleccionado.actividad_id === id) {
            this.registroSeleccionado.actividad_id = null;
          }
        }
      }
    });
  }

  // Sumar tiempo del temporizador a la jornada seleccionada
  sumarTiempoAJornada() {
    if (!this.registroSeleccionado.id || !this.tiempoTranscurrido) return;
    const url = 'http://localhost/TFG/Backend/Jornada.php';
    const body = {
      id: this.registroSeleccionado.id,
      duracion: this.tiempoTranscurrido,
      usuario_id: this.usuario_id
    };
    this.http.put(url, body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mensaje = 'Tiempo sumado correctamente';
          this.cargarRegistros();
          this.resetearTemporizador();
        }
      },
      error: () => this.mensaje = 'Error al sumar el tiempo'
    });
  }

  // --- TEMPORIZADOR ACTIVIDAD ---
  iniciarTemporizadorActividad(actividad: any) {
    if (this.actividadTemporizadorActivo && this.actividadTemporizadorId === actividad.id) return;
    this.actividadTemporizadorId = actividad.id;
    this.actividadTiempoTranscurrido = 0;
    this.actividadTemporizadorActivo = true;
    if (this.actividadTemporizador) clearInterval(this.actividadTemporizador);

    const inicio = Date.now();
    this.actividadTemporizador = setInterval(() => {
      this.ngZone.run(() => {
        this.actividadTiempoTranscurrido = Math.floor((Date.now() - inicio) / 1000);
      });
    }, 1000);
  }

  detenerYRegistrarTemporizadorActividad(actividad: any) {
    this.actividadTemporizadorActivo = false;
    if (this.actividadTemporizador) {
      clearInterval(this.actividadTemporizador);
      this.actividadTemporizador = null;
    }
    if (!this.actividadTiempoTranscurrido) return;
    // Llama al backend para sumar el tiempo a la actividad
    const url = 'http://localhost/TFG/Backend/Actividades.php';
    const body = {
      id: actividad.id,
      tiempo: this.actividadTiempoTranscurrido,
      usuario_id: this.usuario_id,
      sumar_tiempo: true
    };
    this.http.put(url, body).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mensaje = 'Tiempo sumado correctamente';
          this.cargarActividades();
          this.actividadTiempoTranscurrido = 0;
          this.actividadTemporizadorId = null;
        }
      },
      error: () => this.mensaje = 'Error al sumar el tiempo'
    });
  }
}