import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Estado de autenticación en AuthGuard:', isLoggedIn);

    if (isLoggedIn) {
      console.log('Acceso permitido por AuthGuard');
      return true;
    } else {
      console.log('Acceso denegado por AuthGuard. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return false;
    }
  }
}