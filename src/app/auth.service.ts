import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXP_KEY = 'token_exp';

  // Guarda el token y su expiracion en el Storage del navegador
  login(token: string): void {
    const expiresAt = Date.now() + 5 * 60 * 1000;  
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.EXP_KEY, expiresAt.toString()); 
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.EXP_KEY);
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const exp = sessionStorage.getItem(this.EXP_KEY);
  // Si el token o la fecha de exp no existe, no es válido
    const valid = !!token && !!exp && Date.now() < Number(exp);  
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
