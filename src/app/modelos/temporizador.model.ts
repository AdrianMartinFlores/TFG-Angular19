export interface Temporizador {
  id?: number;
  titulo: string;
  duracion: number; 
  horas?: number;   
  minutos?: number;
  segundos?: number; 
  usuario_id: number;
  tiempoRestante?: number; 
  enEjecucion?: boolean; 
  intervalo?: any; 
}