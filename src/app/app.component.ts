import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlarmaService } from './alarma.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'TFG';
  usuario_id: number | null = null;
  private notifiedAlarmas: Set<number> = new Set();
  private audio = new Audio('assets/sounds/notificacion.mp3'); 

  constructor(private alarmaService: AlarmaService, private authService: AuthService) {}

  ngOnInit() {
    // Lee el usuario_id de localStorage al iniciar
    const id = localStorage.getItem('usuario_id');
    this.usuario_id = id ? Number(id) : null;

    if ('Notification' in window) {
      Notification.requestPermission();
    }

    setInterval(() => {
      if (this.usuario_id) {
        this.alarmaService.getAlarmas(this.usuario_id).subscribe((alarmas) => {
          const ahora = new Date();
          alarmas.forEach((alarma) => {
            const alarmaDate = new Date(alarma.fecha_hora);
            // Compara año, mes, día, hora y minuto
            if (
              alarmaDate.getFullYear() === ahora.getFullYear() &&
              alarmaDate.getMonth() === ahora.getMonth() &&
              alarmaDate.getDate() === ahora.getDate() &&
              alarmaDate.getHours() === ahora.getHours() &&
              alarmaDate.getMinutes() === ahora.getMinutes() &&
              !this.notifiedAlarmas.has(alarma.id)
            ) {
              this.notifiedAlarmas.add(alarma.id);
              // Notificación del navegador
              if (Notification.permission === 'granted') {
                new Notification('¡Alarma!', {
                  body: '¡Tienes una alarma programada para ahora!',
                  icon: 'assets/icon.png', // Opcional
                });
              }
              // Sonido
              this.audio.currentTime = 0;
              this.audio.play();
            }
          });
        });
      }
    }, 1000); // Comprobar cada segundo

    // Renueva la sesión en cada acción del usuario
    ['click', 'keydown', 'mousemove'].forEach(event => {
      window.addEventListener(event, () => this.authService.renovarSesion());
    });
  }
}
