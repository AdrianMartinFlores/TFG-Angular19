export interface Temporizador {
  id?: number;
  titulo: string;
  duracion: number; // Duración total en segundos
  horas?: number;   // Horas (opcional)
  minutos?: number; // Minutos (opcional)
  segundos?: number; // Segundos (opcional)
  usuario_id: number;
  tiempoRestante?: number; // Opcional
  enEjecucion?: boolean; // Indica si el temporizador está en ejecución
  intervalo?: any; // Identificador del intervalo
}