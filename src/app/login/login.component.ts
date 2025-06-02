import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule , Router} from '@angular/router';
import { AuthService } from '../auth.service'; // Asegúrate de importar el servicio de autenticación
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  iniciarSesion() {
    this.mensaje = '';
    const credenciales = {
      email: this.email,
      password: this.password,
    };
    console.log('Credenciales enviadas:', credenciales);

    this.http.post<any>('http://localhost/TFG/TfgAngular19/Backend/Login.php', credenciales, {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Inicio de sesión exitoso:', response);

          // Guarda el token y otros datos necesarios en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario_id', response.usuario_id);

          // Cambia el estado de autenticación
          this.authService.login();

          // Redirige al menú
          this.router.navigate(['/menu']).then(() => {
            console.log('Redirigido al menú correctamente.');
          });
        } else {
          console.error('Error en el inicio de sesión:', response.message);
          this.mensaje = 'Error al iniciar sesión: ' + (response.message || 'Credenciales incorrectas');
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.mensaje = 'Error en la solicitud: ' + error.message;
      },
    });
  }
}
