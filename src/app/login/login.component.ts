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

    this.http.post<any>('http://localhost/TFG/Backend/Login.php', credenciales, {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe({
      next: (response: any) => {  
        if (response.success) {
          this.authService.login(response.token); // Solo esta llamada es necesaria

          // Guarda el token y otros datos necesarios en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario_id', response.usuario_id);

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
