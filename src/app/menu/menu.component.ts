import { Component } from '@angular/core';
import { NavComponent } from "../nav/nav.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';   // Importa el servicio de autenticación
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [NavComponent, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})

export class MenuComponent {
  mostrarFunciones: boolean = false; // Variable para controlar la visibilidad del menú
  tabSeleccionado: string = 'tareas'; // Variable para controlar la visibilidad del submenú

  constructor(private authService: AuthService, private router: Router) {}

  toggleFunciones(){
    this.mostrarFunciones = !this.mostrarFunciones;
  }
  seleccionarTab(tab: string){
    this.tabSeleccionado = tab;
  }
  cerrarSesion() {
    this.authService.logout(); // Cambiar el estado a no autenticado
    this.router.navigate(['/login']); // Redirigir al componente de inicio de sesión
  }
}
