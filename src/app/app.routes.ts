import { Routes } from '@angular/router';
import { AutenticacionComponent } from './autenticacion/autenticacion.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { MenuComponent } from './menu/menu.component';
import { TareasComponent } from './tareas/tareas.component';
import { AuthGuard } from './auth.guard';
import { TemporizadoresComponent } from './temporizadores/temporizadores.component';

export const routes: Routes = [
  { path: '', component: AutenticacionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'tareas', component: TareasComponent, canActivate: [AuthGuard] }, // Ruta protegida
  { path: 'temporizadores', component: TemporizadoresComponent, canActivate: [AuthGuard] }, // Ruta protegida
];
