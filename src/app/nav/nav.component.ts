import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  constructor(private router: Router) {}

  onNavigate(route: string) {
    console.log(`Intentando navegar a: ${route}`);
    this.router.navigate([route]).then(success => {
      if (success) {
        console.log(`Navegación exitosa a: ${route}`);
      } else {
        console.error(`Error al navegar a: ${route}`);
      }
    });
  }

  CerrarSesion(){
    localStorage.removeItem('token');
    this.router.navigate(['/']);
    
  }
}