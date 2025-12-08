export interface Vehiculo {
  _id?: string;
  codigo: string;
  nombre: string;
  tarifaDia: number;
  requiereEdad: boolean; // True: >Edad, False: Cualquiera
  estado: 'DISPONIBLE' | 'ALQUILADO';
}