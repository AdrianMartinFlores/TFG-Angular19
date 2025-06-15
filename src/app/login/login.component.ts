import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule , Router} from '@angular/router';
import { AuthService } from '../auth.service'; // Asegúrate de importar el servicio de autenticación
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mensaje: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  // Envía los datos al backend y gestiona la respuesta
  iniciarSesion() {
    this.mensaje = '';
    const credenciales = {
      email: this.email,
      password: this.password,
    };

    this.http.post<any>('http://79.147.185.171/TFG/Backend/Login.php', credenciales, {
      headers: { 'Content-Type': 'application/json' }, 
    }).subscribe({
      next: (response: any) => {  
        if (response.success) {
          this.authService.login(response.token);
          sessionStorage.setItem('token', response.token);
          localStorage.setItem('usuario_id', response.usuario_id);
          this.router.navigate(['/menu']).then(() => {
            console.log('Redirigido al menú correctamente.');
          });
        } else {
          this.mensaje = 'Error al iniciar sesión: ' + (response.message || 'Credenciales incorrectas');
        }
      },
      error: (error) => {
        this.mensaje = 'Error en la solicitud: ' + error.message;
      },
    });
  }
}
