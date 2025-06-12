import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXP_KEY = 'token_exp';

  // Guarda el token y su expiracion en el Storage del navegador
  //El token expira a los 5 minutos
  login(token: string): void {
    const expiresAt = Date.now() + 5 * 60 * 1000; 
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.EXP_KEY, expiresAt.toString()); // fecha de expiración del token
  }

  // Elimina el token
  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.EXP_KEY);
  }

  // Comprueba si el usuario está autenticado y el token no ha expirado
  isLoggedIn(): boolean {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const exp = sessionStorage.getItem(this.EXP_KEY);
  // Verificacion de token y expiración
    const valid = !!token && !!exp && Date.now() < Number(exp);  // exp viene de sessionStorage,se pasa de String a Number
    if (!valid) this.logout();
    return valid;
  }

  // Renueva la sesión
  renovarSesion(): void {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const expiresAt = Date.now() + 5 * 60 * 1000;
      sessionStorage.setItem(this.EXP_KEY, expiresAt.toString()); 
    }
  }
}
