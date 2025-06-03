import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule , Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [RouterModule, FormsModule, HttpClientModule],
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  // Formulario de registro
  email: string = '';
  nombre: string = '';
  contraseña: string = '';
  password: any;

  constructor(private http: HttpClient, private router: Router) {}

  registroUsuario() {
    const usuario = {
      email: this.email,
      nombre: this.nombre,
      password: this.password,
    };

    this.http.post('http://localhost/TFG/Backend/Registro.php', usuario, {
      headers : {'Content-Type': 'application/json' },
    }).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert(response.message);
            //Si todo es correcto te redirige al login para iniciar sesion
            this.router.navigate(['/login']);
          } else {
            alert('Error al registrar el usuario: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          alert('Error en la solicitud: ' + error.message);
        },
      });
  }
}
