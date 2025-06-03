export interface Tarea {
  id?: number;
  titulo: string;
  descripcion: string;
  completada: boolean;
  usuario_id: number;
  grupo_id?: number; 
  color?: string;
}