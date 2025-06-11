import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-control-de-jornada',
  templateUrl: './control-de-jornada.component.html',
  styleUrls: ['./control-de-jornada.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NavComponent]
})
export class ControlDeJornadaComponent implements OnInit {
  registros: any[] = [];
  usuario_id = 0;
  mensaje = '';
  registroSeleccionado: any = { fecha: '', horaEntrada: '', horaSalida: '', nombre: '' };

  autoNombre = '';
  autoFecha = '';
  autoHoraInicio = '';
  autoHoraFin = '';
  autoEnCurso = false;
  private autoInterval: any = null;
  private autoStartDate: Date | null = null;
  autoTiempoFormateado = '00:00:00';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      this.usuario_id = +usuarioId;
      this.cargarRegistros();
    }
    if (localStorage.getItem('jornadaAutoEnCurso') === 'true') {
      this.autoNombre = localStorage.getItem('jornadaAutoNombre') || '';
      this.autoFecha = localStorage.getItem('jornadaAutoFecha') || '';
      this.autoHoraInicio = localStorage.getItem('jornadaAutoHoraInicio') || '';
      this.autoEnCurso = true;
      this.iniciarIntervaloTemporizador();
    }
  }

  cargarRegistros() {
    this.http.get<any[]>(`http://localhost/TFG/Backend/Jornada.php?usuario_id=${this.usuario_id}`)
      .subscribe({ next: data => this.registros = Array.isArray(data) ? data : [] });
  }

  registrarJornada(e: Event) {
    e.preventDefault();
    if (!this.registroSeleccionado.nombre || this.registroSeleccionado.nombre.trim() === '') {
      this.mensaje = 'El nombre de la actividad es obligatorio';
      setTimeout(() => this.mensaje = '', 2000);
      return;
    }
    const b = { ...this.registroSeleccionado, usuario_id: this.usuario_id };
    this.http.post('http://localhost/TFG/Backend/Jornada.php', b)
      .subscribe(() => { this.mensaje = 'Guardado'; this.cargarRegistros(); });
    setTimeout(() => this.mensaje = '', 2000);
  }

  iniciarTemporizador() {
    const now = new Date();
    this.autoFecha = now.toISOString().slice(0, 10);
    this.autoHoraInicio = now.toTimeString().slice(0, 5);
    this.autoHoraFin = '';
    this.autoEnCurso = true;
    this.autoStartDate = now;
    localStorage.setItem('jornadaAutoEnCurso', 'true');
    localStorage.setItem('jornadaAutoNombre', this.autoNombre);
    localStorage.setItem('jornadaAutoFecha', this.autoFecha);
    localStorage.setItem('jornadaAutoHoraInicio', this.autoHoraInicio);
    localStorage.setItem('jornadaAutoStartDate', now.toISOString());
    this.iniciarIntervaloTemporizador();
  }

  private iniciarIntervaloTemporizador() {
    if (this.autoInterval) clearInterval(this.autoInterval);
    this.autoInterval = setInterval(() => {
      const startIso = localStorage.getItem('jornadaAutoStartDate');
      const startDate = startIso ? new Date(startIso) : this.autoStartDate || new Date();
      const diffMs = new Date().getTime() - startDate.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      this.autoTiempoFormateado =
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
      const fin = new Date();
      this.autoHoraFin = fin.toTimeString().slice(0, 5);
    }, 1000);
  }

  finalizarTemporizador() {
    if (!this.autoNombre || this.autoNombre.trim() === '') {
      this.mensaje = 'El nombre de la actividad es obligatorio';
      setTimeout(() => this.mensaje = '', 2000);
      return;
    }
    if (this.autoInterval) clearInterval(this.autoInterval);
    this.autoEnCurso = false;
    const nombre = localStorage.getItem('jornadaAutoNombre') || this.autoNombre;
    const fecha = localStorage.getItem('jornadaAutoFecha') || this.autoFecha;
    const horaEntrada = localStorage.getItem('jornadaAutoHoraInicio') || this.autoHoraInicio;
    const horaSalida = this.autoHoraFin;

    // Calcular duración en segundos
    if (horaEntrada && horaSalida) {
      const [h1, m1] = horaEntrada.split(':').map(Number);
      const [h2, m2] = horaSalida.split(':').map(Number);
      const [s1, s2] = [0, 0]; // Si quieres segundos reales, cámbialo aquí
      let segundos = ((h2 * 60 + m2) * 60 + s2) - ((h1 * 60 + m1) * 60 + s1);
      if (segundos < 0) segundos += 24 * 60 * 60;

      const b = {
        nombre,
        fecha,
        horaEntrada,
        horaSalida,
        duracion: segundos,
        usuario_id: this.usuario_id
      };
      this.http.post('http://localhost/TFG/Backend/Jornada.php', b)
        .subscribe(() => {
          this.mensaje = 'Jornada automática guardada';
          this.cargarRegistros();
          localStorage.removeItem('jornadaAutoEnCurso');
          localStorage.removeItem('jornadaAutoNombre');
          localStorage.removeItem('jornadaAutoFecha');
          localStorage.removeItem('jornadaAutoHoraInicio');
          localStorage.removeItem('jornadaAutoStartDate');
          this.autoNombre = '';
          this.autoFecha = '';
          this.autoHoraInicio = '';
          this.autoHoraFin = '';
          this.autoStartDate = null;
          this.autoTiempoFormateado = '00:00:00';
        });
      setTimeout(() => this.mensaje = '', 2000);
    }
  }

  mostrarColumnaDuracion(): boolean {
    return this.registros && this.registros.some(r => !!r.duracion);
  }

  formatearDuracion(segundos: number): string {
    if (!segundos || segundos <= 0) return '';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h}h ${m}m ${s}s`;
  }

  calcularDuracionRegistro(registro: any): string {
    if (!registro.horaEntrada || !registro.horaSalida) return '';
    const [h1, m1] = registro.horaEntrada.split(':').map(Number);
    const [h2, m2] = registro.horaSalida.split(':').map(Number);
    // Si algún campo no es válido, no mostrar nada
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';
    let segundos = ((h2 * 60 + m2) * 60) - ((h1 * 60 + m1) * 60);
    if (segundos < 0) segundos += 24 * 60 * 60;
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h}h ${m}m ${s}s`;
  }
}