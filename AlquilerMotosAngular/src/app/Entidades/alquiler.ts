import { Cliente } from './cliente'; // Asegúrate de importar Cliente

export interface Alquiler {
  _id?: string;
  // CAMBIO CLAVE:
  // Puede ser string (cuando envías el ID para crear) 
  // O puede ser de tipo Cliente (cuando recibes el dato con populate)
  clienteId: string | Cliente; 
  
  vehiculoCodigo: string;
  fechaInicio: Date;
  fechaTentativa: Date;
  fechaDevolucionReal?: Date;
  
  // Datos Financieros calculados
  diasCalculados: number;
  importeBase: number;
  descuentoExtendido: number;
  descuentoFrecuente: number;
  deposito: number;
  totalPagadoInicial: number;
  
  // Datos de Devolución
  diasMora?: number;
  multa?: number;
  estado: 'ACTIVO' | 'FINALIZADO';
}