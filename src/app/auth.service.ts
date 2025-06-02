import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'estaLogueado'; // Clave para almacenar el estado en localStorage

  login(): void {
    console.log('Usuario autenticado');
    localStorage.setItem(this.AUTH_KEY, 'true'); // Guardar el estado de autenticación
  }

  logout(): void {
    console.log('Usuario no autenticado');
    localStorage.removeItem(this.AUTH_KEY); // Eliminar el estado de autenticación
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const estado = !!token;
    console.log('Estado de autenticación:', estado);
    return estado;
  }
}