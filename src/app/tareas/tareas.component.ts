import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavComponent } from "../nav/nav.component";
import { Tarea } from '../modelos/tarea.model';
import { GrupoTareasService } from '../grupo-tareas.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [FormsModule, CommonModule, NavComponent,],
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
})

export class TareasComponent {
  tareas: any[] = [];
  tareasPendientes: any[] = [];
  tareasCompletadas: any[] = [];
  tareaSeleccionada: any = { id: null, titulo: '', descripcion: '', completada: false, color: '#23272f' };
  usuario_id: number = 0;
  grupos: any[] = [];
  grupoSeleccionado: number | null = null;
  mostrarCrearGrupo = false;
  nuevoGrupoNombre = '';
  mensaje: string = '';
  mensajeGrupo: string = '';
  grupoEditandoId: number | null = null;
  nuevoNombreGrupoEditando: string = '';
  tareaModalAbierto = false;
  tareaModal: any = {};

  constructor(
    private router: Router,
    private http: HttpClient,
    private gruposTareasService: GrupoTareasService
  ) { }
  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      this.usuario_id = parseInt(usuarioId);
      this.gruposTareasService.getGrupos(this.usuario_id).subscribe((grupos: any[]) => {
        this.grupos = grupos;
        if (grupos.length) {
          this.grupoSeleccionado = grupos[0].id;
        } else {
          this.grupoSeleccionado = null;
        }
        this.cargarTareasPorGrupo();
      });
    } else {
      console.error('No se encontró el usuario_id en localStorage');
    }
  }

  cargarTareas() {
    const url = 'http://79.147.185.171/Backend/Tareas.php';

    this.http.get<Tarea[]>(url, {
      params: { usuario_id: this.usuario_id.toString() }
    }).subscribe({
      next: (data) => {
        data.forEach(t => {
          {
            t.color = '#23272f';
          }
        });
        this.tareasPendientes = data.filter(tarea => !tarea.completada);
        this.tareasCompletadas = data.filter(tarea => tarea.completada);
      },
      error: (error) => {
        console.log('Error al cargar las tareas:', error);
      },
    });
  }

  guardarTarea(event: Event) {
    event.preventDefault();
    if (!this.tareaSeleccionada.color) {
      this.tareaSeleccionada.color = '#fafdff';
    }
    const url = 'http://79.147.185.171/TFG/Backend/Tareas.php';
    const method = this.tareaSeleccionada.id ? 'PUT' : 'POST';

    this.http.request(method, url, {
      body: { ...this.tareaSeleccionada, usuario_id: this.usuario_id }
    }).subscribe({ next: (res: any) => { 
      if (res.success) {
          if (this.grupoSeleccionado) {
            this.cargarTareasPorGrupo();
          } else {
            this.cargarTareas();
          }
          this.tareaSeleccionada = { id: null, titulo: '', descripcion: '', completada: false, color: '#23272f' };
          this.mensaje = '';
        } else {
          this.mensaje = res.message || 'Error al guardar la tarea';
        }
      },
      error: (error) => {
        this.mensaje = 'Error al guardar la tarea';
      },
    });
  }
  //Copia la tarea al formulario
  editarTarea(tarea: any) { 
    this.tareaSeleccionada = { ...tarea };
  }

  eliminarTarea(id: number) {
    const url = 'http://79.147.185.171/TFG/Backend/Tareas.php';

    this.http.request('DELETE', url, {
      body: { id, usuario_id: this.usuario_id }
    }).subscribe({
      next: () => {
        console.log('Tarea eliminada correctamente');
        this.cargarTareas();
      },
      error: (error) => {
        console.error('Error al eliminar la tarea:', error);
      },
    });
  }

  completarTarea(tarea: Tarea) {
    const url = 'http://79.147.185.171/TFG/Backend/Tareas.php';
    const body = {
      id: tarea.id,
      completada: true,
      usuario_id: this.usuario_id,
    };

    console.log('Datos enviados al backend:', body);

    this.http.put(url, body).subscribe({
      next: () => {
        console.log(`Tarea "${tarea.titulo}" marcada como completada.`);
        this.cargarTareas();
      },
      error: (error) => {
        console.error('Error al completar la tarea:', error);
      },
    });
  }

  marcarComoNoTerminada(tarea: Tarea) {
    const url = 'http://79.147.185.171/TFG/Backend/Tareas.php';
    const body = {
      id: tarea.id,
      completada: false,
      usuario_id: this.usuario_id,
    };

    this.http.put(url, body).subscribe({
      next: () => {
        console.log(`Tarea "${tarea.titulo}" marcada como no terminada.`);
        this.cargarTareas();
      },
      error: (error) => {
        console.error('Error al marcar la tarea como no terminada:', error);
      },
    });
  }

  volverAlMenu() {
    this.router.navigate(['/menu']);
  }

  crearGrupo() {
    if (!this.nuevoGrupoNombre) {
      this.mensajeGrupo = 'El nombre del grupo no puede estar vacío';
      setTimeout(() => this.mensajeGrupo = '', 3000);
      return;
    }
    // res : any hace referencia a la respuesta del backend
    this.gruposTareasService.crearGrupo(this.nuevoGrupoNombre, this.usuario_id).subscribe((res: any) => {
      this.grupos.push({ id: res.id, nombre: this.nuevoGrupoNombre });
      this.nuevoGrupoNombre = '';
      this.mostrarCrearGrupo = false;
      this.mensajeGrupo = '¡Grupo creado correctamente!';
      setTimeout(() => this.mensajeGrupo = '', 3000);
    });
  }

  editarGrupo(grupo: any) {
    this.grupoEditandoId = grupo.id;
    this.nuevoNombreGrupoEditando = grupo.nombre;
  }

  guardarEdicionGrupo(grupo: any) {
    if (this.nuevoNombreGrupoEditando.trim() === '') return; // Evita nombres vacios
    this.gruposTareasService.editarGrupo(grupo.id, this.nuevoNombreGrupoEditando, this.usuario_id).subscribe(() => {
      grupo.nombre = this.nuevoNombreGrupoEditando;
      this.grupoEditandoId = null;
      this.nuevoNombreGrupoEditando = '';
    });
  }

  cancelarEdicionGrupo() {
    this.grupoEditandoId = null;
    this.nuevoNombreGrupoEditando = '';
  }

  eliminarGrupo(id: number) {
    if (confirm('¿Seguro que quieres eliminar este grupo?')) {
      this.gruposTareasService.eliminarGrupo(id, this.usuario_id).subscribe(() => {
        this.grupos = this.grupos.filter(g => g.id !== id); // Filtra el grupo eliminado
      });
    }
  }

  cargarTareasPorGrupo() {
    const url = 'http://79.147.185.171/TFG/Backend/Tareas.php';
    const params: any = { usuario_id: this.usuario_id.toString() };
    if (this.grupoSeleccionado) {
      params.grupo_id = this.grupoSeleccionado;
    }
    //Interfaz de Tarea
    this.http.get<Tarea[]>(url, { params }).subscribe({
      next: (data) => {
        this.tareasPendientes = data.filter(tarea => !tarea.completada);
        this.tareasCompletadas = data.filter(tarea => tarea.completada);
      },
      error: (error) => {
        console.error('Error al cargar las tareas:', error);
      },
    });
  }

  abrirModalTarea(tarea: any) {
    this.tareaModal = { ...tarea, color: tarea.color || '#fafdff' };
    this.tareaModalAbierto = true;
  }

  cerrarModalTarea() {
    this.tareaModalAbierto = false;
    this.tareaModal = {};
  }

  guardarTareaDesdeModal(event: Event) {
    event.preventDefault();
    this.tareaSeleccionada = { ...this.tareaModal };
    this.guardarTarea(event);
    this.cerrarModalTarea();
  }

  getNombreGrupo(grupo_id: number): string {
    const grupo = this.grupos.find(g => g.id === grupo_id);
    return grupo ? grupo.nombre : 'Sin grupo';
  }
}




