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
  usuario_id = Number(localStorage.getItem('usuario_id')); // O como lo gestiones

  alarmas: any[] = [];
  editandoId: number|null = null;

  constructor(private alarmaService: AlarmaService) {}

  ngOnInit() {
    this.cargarAlarmas();
  }

  cargarAlarmas() {
    this.alarmaService.getAlarmas(this.usuario_id).subscribe(alarmas => {
      this.alarmas = alarmas;
    });
  }

  programarAlarma() {
    if (!this.fechaHora) {
      this.mensaje = 'Por favor, introduce una fecha y hora válidas.';
      return;
    }
    this.alarmaService.programarAlarma(this.usuario_id, this.fechaHora).subscribe(() => {
      this.mensaje = '✅ Alarma programada correctamente.';
      this.fechaHora = '';
      this.cargarAlarmas();
      setTimeout(() => this.mensaje = '', 4000);
    });
  }

  eliminarAlarma(id: number) {
    this.alarmaService.eliminarAlarma(id).subscribe(() => {
      this.cargarAlarmas();
    });
  }

  editar(alarma: any) {
    this.editandoId = alarma.id;
    this.fechaHora = alarma.fecha_hora.substring(0,16); // formato para input datetime-local
  }

  guardarEdicion() {
    if (this.editandoId && this.fechaHora) {
      this.alarmaService.editarAlarma(this.editandoId, this.fechaHora).subscribe(() => {
        this.mensaje = '✅ Alarma editada correctamente.';
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
}
