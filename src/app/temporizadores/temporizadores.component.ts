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
    }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setTimeout(() => this.recuperarTemporizadorActivo(), 500);
  }

  // Recupera el temporizador activo desde localStorage al cargar el componente.
  // Así, si el usuario recarga la página o navega, el temporizador sigue funcionando.
  recuperarTemporizadorActivo() {
    const guardado = localStorage.getItem('temporizador_activo');
    if (guardado) {
      const data = JSON.parse(guardado);
      // Busca el temporizador en la lista por su id
      const temporizador = this.temporizadores.find(t => t.id === data.id);
      if (temporizador) {
        // Restaura la duración y el instante de inicio guardados
        temporizador.duracion = data.duracion;
        temporizador.inicio = data.inicio;
        // Calcula cuántos segundos han pasado desde que se inició
        const transcurrido = Math.floor((Date.now() - temporizador.inicio!) / 1000);
        // Calcula el tiempo restante
        temporizador.tiempoRestante = temporizador.duracion - transcurrido;
        if (temporizador.tiempoRestante > 0) {
          // Si aún queda tiempo, lo pone en ejecución y lo reactiva
          temporizador.enEjecucion = true;
          this.iniciarCuentaAtras(temporizador);
        } else {
          // Si ya terminó, lo marca como parado y limpia el localStorage
          temporizador.tiempoRestante = 0;
          temporizador.enEjecucion = false;
          localStorage.removeItem('temporizador_activo');
        }
      }
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
          this.recuperarTemporizadorActivo();
        },
        error: (err) => {
          console.error('Error al cargar los temporizadores:', err);
        },
      });
  }

  // Inicia o reanuda la cuenta atrás de un temporizador.
  // Guarda el estado en localStorage para que no se pierda si recargo o navego.
  iniciarCuentaAtras(temporizador: Temporizador) {
    // Si ya hay un intervalo corriendo, lo limpia para evitar duplicados
    if (temporizador.intervalo) {
      clearInterval(temporizador.intervalo);
    }
    const ahora = Date.now();
    temporizador.enEjecucion = true;
    // Si ya tenía un inicio guardado, lo usa; si no, pone el actual
    temporizador.inicio = temporizador.inicio || ahora;
    // Calcula la duración si no está puesta (por si viene de un formulario)
    temporizador.duracion = temporizador.duracion || (temporizador.horas! * 3600 + temporizador.minutos! * 60 + temporizador.segundos!);
    // Si no hay tiempo restante, lo pone igual que la duración
    temporizador.tiempoRestante = temporizador.tiempoRestante ?? temporizador.duracion;

    // Guarda el estado en localStorage (id, inicio y duración)
    localStorage.setItem('temporizador_activo', JSON.stringify({
      id: temporizador.id,
      inicio: temporizador.inicio,
      duracion: temporizador.duracion
    }));

    // Crea el intervalo que actualiza el tiempo restante cada segundo
    temporizador.intervalo = setInterval(() => {
      // Calcula los segundos transcurridos desde el inicio
      const transcurrido = Math.floor((Date.now() - (temporizador.inicio!)) / 1000);
      // Actualiza el tiempo restante
      temporizador.tiempoRestante = temporizador.duracion - transcurrido;
      if (temporizador.tiempoRestante <= 0) {
        // Si se acaba el tiempo, limpia el intervalo, marca como parado y elimina del localStorage
        clearInterval(temporizador.intervalo);
        temporizador.enEjecucion = false;
        temporizador.tiempoRestante = 0;
        localStorage.removeItem('temporizador_activo');
        // Llama a la función de notificación (sonido y alerta)
        this.notificarFin(temporizador);
      }
    }, 1000);
  }

  // Pausa el temporizador: limpia el intervalo y guarda el tiempo restante en localStorage
  pausarCuentaAtras(temporizador: Temporizador) {
    if (temporizador.intervalo) {
      clearInterval(temporizador.intervalo);
      temporizador.enEjecucion = false;
      // Calcula el tiempo restante y lo guarda en localStorage
      const transcurrido = Math.floor((Date.now() - (temporizador.inicio!)) / 1000);
      temporizador.tiempoRestante = temporizador.duracion - transcurrido;
      localStorage.setItem('temporizador_activo', JSON.stringify({
        id: temporizador.id,
        inicio: temporizador.inicio,
        duracion: temporizador.duracion
      }));
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
    const guardado = localStorage.getItem('temporizador_activo');
    if (guardado && JSON.parse(guardado).id === id) {
      localStorage.removeItem('temporizador_activo');
    }
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
          this.nuevoTemporizador = { titulo: '', duracion: 0, usuario_id: this.nuevoTemporizador.usuario_id };
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
    return `${horas.toString().padStart(2, '0')}:${minutos
      .toString()
      .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  notificarFin(temporizador: Temporizador) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`El temporizador "${temporizador.titulo}" ha terminado`);
    }
    const audio = new Audio('assets/sounds/notificacion.mp3');
    audio.play().catch(() => {});
  }
}
