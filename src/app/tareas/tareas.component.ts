import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavComponent } from "../nav/nav.component";
import { Tarea } from '../modelos/tarea.model';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [FormsModule, CommonModule, NavComponent],
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
})
export class TareasComponent {
  tareas: any[] = [];
  tareasPendientes: any[] = [];
  tareasCompletadas: any[] = [];
  tareaSeleccionada: any = { id: null, titulo: '', descripcion: '', completada: false };
  usuario_id: number = 1;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id'); // Obtén el usuario_id del localStorage
    if (usuarioId) {
      this.usuario_id = parseInt(usuarioId, 10); // Asegúrate de convertirlo a número
      this.cargarTareas();
    } else {
      console.error('No se encontró el usuario_id en localStorage');
    }
  }

  cargarTareas() {
    const url = 'http://localhost/TFG/TfgAngular19/Backend/Tareas.php';

    this.http.get<Tarea[]>(url, {
      params: { usuario_id: this.usuario_id.toString() }
    }).subscribe({
      next: (data) => {
        console.log('Tareas obtenidas:', data);
        this.tareasPendientes = data.filter(tarea => !tarea.completada);
        this.tareasCompletadas = data.filter(tarea => tarea.completada);
      },
      error: (error) => {
        console.error('Error al cargar las tareas:', error);
      },
    });
  }

  guardarTarea(event: Event) {
    event.preventDefault();
    const url = 'http://localhost/TFG/TfgAngular19/Backend/Tareas.php';
    const method = this.tareaSeleccionada.id ? 'PUT' : 'POST';

    this.http.request(method, url, {
      body: { ...this.tareaSeleccionada, usuario_id: this.usuario_id }
    }).subscribe({
      next: () => {
        this.cargarTareas(); // Recarga las tareas después de guardar
        this.tareaSeleccionada = { id: null, titulo: '', descripcion: '', completada: false }; // Reinicia el formulario
      },
      error: (error) => {
        console.error('Error al guardar la tarea:', error);
      },
    });
  }

  editarTarea(tarea: any) {
    this.tareaSeleccionada = { ...tarea };
  }

  eliminarTarea(id: number) {
    const url = 'http://localhost/TFG/TfgAngular19/Backend/Tareas.php';

    this.http.request('DELETE', url, {
      body: { id, usuario_id: this.usuario_id } // Asegúrate de enviar el usuario_id
    }).subscribe({
      next: () => {
        console.log('Tarea eliminada correctamente');
        this.cargarTareas(); // Recarga las tareas después de eliminar
      },
      error: (error) => {
        console.error('Error al eliminar la tarea:', error);
      },
    });
  }

  completarTarea(tarea: Tarea) {
    const url = 'http://localhost/TFG/TfgAngular19/Backend/Tareas.php';
    const body = {
      id: tarea.id,
      completada: true,
      usuario_id: this.usuario_id,
    };

    console.log('Datos enviados al backend:', body);

    this.http.put(url, body).subscribe({
      next: () => {
        console.log(`Tarea "${tarea.titulo}" marcada como completada.`);
        this.cargarTareas(); // Recarga las tareas después de actualizar
      },
      error: (error) => {
        console.error('Error al completar la tarea:', error);
      },
    });
  }

  marcarComoNoTerminada(tarea: Tarea) {
    const url = 'http://localhost/TFG/TfgAngular19/Backend/Tareas.php';
    const body = {
      id: tarea.id,
      completada: false,
      usuario_id: this.usuario_id,
    };

    this.http.put(url, body).subscribe({
      next: () => {
        console.log(`Tarea "${tarea.titulo}" marcada como no terminada.`);
        this.cargarTareas(); // Recarga las tareas después de actualizar
      },
      error: (error) => {
        console.error('Error al marcar la tarea como no terminada:', error);
      },
    });
  }

  volverAlMenu() {
    this.router.navigate(['/menu']); // Navegar al menú
  }
}




