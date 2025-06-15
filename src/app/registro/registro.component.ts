import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule , Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [RouterModule, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class RegistroComponent {

  mensaje: string = '';
  email: string = '';
  nombre: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  registroUsuario() {
    this.mensaje = '';  

    if (!this.email || !this.nombre || !this.password) {
      if (!this.email) {
        this.mensaje = 'El correo es obligatorio.';
      } else if (!this.nombre) {
        this.mensaje = 'El nombre es obligatorio.';
      } else if (!this.password) {
        this.mensaje = 'La contraseña es obligatoria.';
      }
      return;
    }

    const usuario = {
      email: this.email,
      nombre: this.nombre,
      password: this.password,
    };
    this.http.post('http://79.147.185.171/TFG/Backend/Registro.php', usuario, {
      headers : {'Content-Type': 'application/json' }, // Se establece el contenido en Json
    }).subscribe({  
        next: (response: any) => {
          if (response.success) {
            this.mensaje = response.message;
            setTimeout(() => this.router.navigate(['/login']), 1500);
          } else {
            this.mensaje = 'Error al registrar el usuario: ' + response.message;
          }
        },
        error: (error) => {
          this.mensaje = 'Error en la solicitud: ' + error.message;
        },
      });
  }
}
