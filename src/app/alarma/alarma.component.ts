import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { AlarmaService } from '../alarma.service';

@Component({
  selector: 'app-alarma',
  templateUrl: './alarma.component.html',
  styleUrl: './alarma.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent]
})
export class AlarmaComponent implements OnInit {
  fechaHora: string = '';
  mensaje: string = '';
  usuario_id = Number(localStorage.getItem('usuario_id'));
  alarmas: any[] = [];
  editandoId: number|null = null;

  constructor(private alarmaService: AlarmaService) {}

  ngOnInit() {
    this.cargarAlarmas();
    // Comprueba cada 10s si alguna alarma debe sonar
    setInterval(() => {
      const ahora = new Date();
      this.alarmas.forEach(alarma => {
        const fechaAlarma = new Date(alarma.fecha_hora);
        if (
          fechaAlarma <= ahora &&
          fechaAlarma > new Date(ahora.getTime() - 15000) &&
          !alarma.sonada
        ) {
          this.activarAlarma(alarma);
          alarma.sonada = true;
        }
      });
    }, 10000);
  }

  cargarAlarmas() {
    this.alarmaService.getAlarmas(this.usuario_id).subscribe((alarmas: any[]) => {
      const ahora = new Date();
      this.alarmas = alarmas.filter(a => new Date(a.fecha_hora) > ahora);
    });
  }

  programarAlarma() {
    if (!this.fechaHora) {
      this.mensaje = 'Por favor, introduce una fecha y hora válidas.';
      return;
    }
    const ahora = new Date();
    const fechaAlarma = new Date(this.fechaHora);
    if (fechaAlarma <= ahora) {
      this.mensaje = 'La fecha y hora deben ser futuras.';
      return;
    }
    this.alarmaService.programarAlarma(this.usuario_id, this.fechaHora, '').subscribe(() => {
      this.mensaje = 'Alarma programada correctamente.';
      this.fechaHora = '';
      this.cargarAlarmas();
      setTimeout(() => this.mensaje = '', 4000);
    });
  }

  editar(alarma: any) {
    this.editandoId = alarma.id;
    this.fechaHora = alarma.fecha_hora.substring(0, 16);
  }

  guardarEdicion() {
    if (!this.fechaHora) {
      this.mensaje = 'Por favor, introduce una fecha y hora válidas.';
      return;
    }
    const ahora = new Date();
    const fechaAlarma = new Date(this.fechaHora);
    if (fechaAlarma <= ahora) {
      this.mensaje = 'La fecha y hora deben ser futuras.';
      return;
    }
    if (this.editandoId !== null) {
      this.alarmaService.editarAlarma(this.editandoId, this.fechaHora, this.usuario_id).subscribe(() => {
        this.mensaje = 'Alarma actualizada correctamente.';
        this.editandoId = null;
        this.fechaHora = '';
        this.cargarAlarmas();
        setTimeout(() => this.mensaje = '', 4000);
      });
    }
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.fechaHora = '';
  }

  eliminarAlarma(id: number) {
    this.alarmaService.eliminarAlarma(id).subscribe(() => {
      this.mensaje = 'Alarma eliminada correctamente.';
      this.cargarAlarmas();
      setTimeout(() => this.mensaje = '', 3000);
    });
  }

  activarAlarma(alarma: any) {
    alert('¡Tienes una alarma programada para ahora!');
  }
}
