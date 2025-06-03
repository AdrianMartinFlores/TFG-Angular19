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
  imports: [FormsModule, CommonModule, NavComponent, ],
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css',
})
export class TareasComponent {
  tareas: any[] = [];
  tareasPendientes: any[] = [];
  tareasCompletadas: any[] = [];
  tareaSeleccionada: any = { id: null, titulo: '', descripcion: '', completada: false, color: '#23272f' };
  usuario_id: number = 1;
  grupos: any[] = [];
  grupoSeleccionado: number|null = null;
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
  ) {}

  ngOnInit() {
    const usuarioId = localStorage.getItem('usuario_id');
    if (usuarioId) {
      this.usuario_id = parseInt(usuarioId, 10);
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
    const url = 'http://localhost/TFG/Backend/Tareas.php';

    this.http.get<Tarea[]>(url, {
      params: { usuario_id: this.usuario_id.toString() }
    }).subscribe({
      next: (data) => {
        // Asegura que cada tarea tenga un color válido
        data.forEach(t => {
          if (!t.color || !/^#[0-9A-Fa-f]{6}$/.test(t.color)) {
            t.color = '#23272f';
          }
        });
        this.tareasPendientes = data.filter(tarea => !tarea.completada);
        this.tareasCompletadas = data.filter(tarea => tarea.completada);
      },
      error: (error) => {
        // Manejo de error
      },
    });
  }

  guardarTarea(event: Event) {
    event.preventDefault();
    if (!this.tareaSeleccionada.color || !/^#[0-9A-Fa-f]{6}$/.test(this.tareaSeleccionada.color)) {
      this.tareaSeleccionada.color = '#23272f';
    }
    const url = 'http://localhost/TFG/Backend/Tareas.php';
    const method = this.tareaSeleccionada.id ? 'PUT' : 'POST';

    this.http.request(method, url, {
      body: { ...this.tareaSeleccionada, usuario_id: this.usuario_id }
    }).subscribe({
      next: (res: any) => {
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

  editarTarea(tarea: any) {
    this.tareaSeleccionada = { ...tarea };
  }

  eliminarTarea(id: number) {
    const url = 'http://localhost/TFG/Backend/Tareas.php';

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
    const url = 'http://localhost/TFG/Backend/Tareas.php';
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
    const url = 'http://localhost/TFG/Backend/Tareas.php';
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
    if (!this.nuevoGrupoNombre || this.nuevoGrupoNombre.trim() === '') {
      this.mensajeGrupo = 'El nombre del grupo no puede estar vacío';
      setTimeout(() => this.mensajeGrupo = '', 3000);
      return;
    }
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
    if (this.nuevoNombreGrupoEditando.trim() === '') return;
    this.gruposTareasService.editarGrupo(grupo.id, this.nuevoNombreGrupoEditando).subscribe(() => {
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
      this.gruposTareasService.eliminarGrupo(id).subscribe(() => {
        this.grupos = this.grupos.filter(g => g.id !== id);
        // Opcional: recargar tareas si el grupo eliminado estaba seleccionado
      });
    }
  }

  cargarTareasPorGrupo() {
    const url = 'http://localhost/TFG/Backend/Tareas.php';
    const params: any = { usuario_id: this.usuario_id.toString() };
    if (this.grupoSeleccionado) {
      params.grupo_id = this.grupoSeleccionado;
    }
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
    this.tareaModal = { ...tarea, color: tarea.color || '#23272f' };
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

  getTextColor(bgColor?: string): string {
    if (!bgColor) return '#fff';
    // Simple contraste: si es claro, texto oscuro; si es oscuro, texto claro
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0,2),16);
    const g = parseInt(color.substring(2,4),16);
    const b = parseInt(color.substring(4,6),16);
    const brightness = (r*299 + g*587 + b*114) / 1000;
    return brightness > 128 ? '#222' : '#fff';
  }
}




