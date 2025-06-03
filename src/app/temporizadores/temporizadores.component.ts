import { Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { Temporizador } from '../modelos/temporizador.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temporizadores',
  imports: [NavComponent, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './temporizadores.component.html',
  styleUrl: './temporizadores.component.css',
})
export class TemporizadoresComponent {
  temporizadores: Temporizador[] = [];
  nuevoTemporizador: Temporizador = { titulo: '', duracion: 0, usuario_id: 1 };
  editando: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      this.nuevoTemporizador.usuario_id = parseInt(usuarioId, 10);
      this.cargarTemporizadores();
    } else {
      console.error('No se encontró el usuario_id en localStorage');
    }

    // Solicitar permiso para notificaciones
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  cargarTemporizadores() {
    this.http
      .get<Temporizador[]>(
        'http://localhost/TFG/Backend/Temporizadores.php',
        {
          params: {
            usuario_id: this.nuevoTemporizador.usuario_id.toString(),
          },
        }
      )
      .subscribe({
        next: (data) => {
          this.temporizadores = data;
        },
        error: (err) => {
          console.error('Error al cargar los temporizadores:', err);
        },
      });
  }

  crearTemporizador() {
    this.http
      .post(
        'http://localhost/TFG/Backend/Temporizadores.php',
        this.nuevoTemporizador
      )
      .subscribe({
        next: () => {
          this.cargarTemporizadores();
          this.nuevoTemporizador = {
            titulo: '',
            duracion: 0,
            usuario_id: this.nuevoTemporizador.usuario_id,
          };
        },
        error: (err) => {
          console.error('Error al crear el temporizador:', err);
          alert('Hubo un error al crear el temporizador.');
        },
      });
  }

  iniciarCuentaAtras(temporizador: Temporizador) {
    if (temporizador.tiempoRestante === undefined || temporizador.tiempoRestante <= 0) {
      temporizador.tiempoRestante = temporizador.duracion; // Inicializa con la duración total
    }

    temporizador.enEjecucion = true;
    temporizador.intervalo = setInterval(() => {
      if (temporizador.tiempoRestante && temporizador.tiempoRestante > 0) {
        temporizador.tiempoRestante--;
        console.log(`Tiempo restante para "${temporizador.titulo}": ${temporizador.tiempoRestante}s`);
      } else {
        clearInterval(temporizador.intervalo);
        temporizador.enEjecucion = false;
        console.log(`El temporizador "${temporizador.titulo}" ha terminado.`);

        // Mostrar notificación del navegador
        if (Notification.permission === 'granted') {
          new Notification(`El temporizador "${temporizador.titulo}" ha terminado`);
        }

        // Reproducir sonido
        const audioElement = document.getElementById('notificacion-audio') as HTMLAudioElement;
        if (audioElement) {
          audioElement.play().catch((err) => {
            console.error('Error al reproducir el sonido:', err);
          });
        }
      }
    }, 1000);
  }

  pausarCuentaAtras(temporizador: Temporizador) {
    if (temporizador.intervalo) {
      clearInterval(temporizador.intervalo);
      temporizador.enEjecucion = false;
      console.log(`El temporizador "${temporizador.titulo}" ha sido pausado.`);
    }
  }

  editarTemporizador(temporizador: Temporizador) {
    this.nuevoTemporizador = { ...temporizador };
    this.nuevoTemporizador.horas = Math.floor(temporizador.duracion / 3600);
    this.nuevoTemporizador.minutos = Math.floor((temporizador.duracion % 3600) / 60);
    this.nuevoTemporizador.segundos = temporizador.duracion % 60;
    this.editando = true;
  }

  borrarTemporizador(id: number) {
    this.http.delete(`http://localhost/TFG/Backend/Temporizadores.php`, {
      body: { id, usuario_id: this.nuevoTemporizador.usuario_id }
    }).subscribe({
      next: () => {
        this.cargarTemporizadores();
      },
      error: (err) => {
        console.error('Error al borrar el temporizador:', err);
      },
    });
  }

  guardarTemporizador() {
    const horas = this.nuevoTemporizador.horas || 0;
    const minutos = this.nuevoTemporizador.minutos || 0;
    const segundos = this.nuevoTemporizador.segundos || 0;
    this.nuevoTemporizador.duracion = horas * 3600 + minutos * 60 + segundos;

    if (this.editando) {
      this.http.put('http://localhost/TFG/Backend/Temporizadores.php', this.nuevoTemporizador)
        .subscribe(() => {
          this.cargarTemporizadores();
          this.cancelarEdicion();
        });
    } else {
      this.http.post('http://localhost/TFG/Backend/Temporizadores.php', this.nuevoTemporizador)
        .subscribe(() => {
          this.cargarTemporizadores();
          this.nuevoTemporizador = { titulo: '', duracion: 0, usuario_id: 1 };
        });
    }
  }

  cancelarEdicion() {
    this.nuevoTemporizador = { titulo: '', duracion: 0, usuario_id: this.nuevoTemporizador.usuario_id };
    this.editando = false;
  }

  esDuracionValida(): boolean {
    const { horas = 0, minutos = 0, segundos = 0 } = this.nuevoTemporizador;
    return horas > 0 || minutos > 0 || segundos > 0;
  }

  formatearTiempo(segundosTotales: number): string {
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    const horasStr = horas.toString().padStart(2, '0');
    const minutosStr = minutos.toString().padStart(2, '0');
    const segundosStr = segundos.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr}:${segundosStr}`;
  }
}
