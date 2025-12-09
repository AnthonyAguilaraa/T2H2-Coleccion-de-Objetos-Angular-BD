import { inject, Injectable } from '@angular/core';
import { Vehiculo } from '../Entidades/vehiculo';
import { Cliente } from '../Entidades/cliente';
import { Alquiler } from '../Entidades/alquiler';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EcoMoveService {
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api'; // URL de tu Backend

  // --- STATE MANAGEMENT (Para que tus componentes sigan reactivos) ---
  public vehiculos$ = new BehaviorSubject<Vehiculo[]>([]);
  public clientes$ = new BehaviorSubject<Cliente[]>([]);
  public alquileres$ = new BehaviorSubject<Alquiler[]>([]);

  constructor() {
    this.cargarDatosIniciales();
  }

  // Carga inicial de todo
  cargarDatosIniciales() {
    this.obtenerClientes();
    this.obtenerVehiculos();
    this.obtenerAlquileres();
  }

  // ==========================================
  // METODOS API (GET & REFRESH)
  // ==========================================

  obtenerClientes() {
  this.http.get<Cliente[]>(`${this.apiUrl}/clientes`)
    .subscribe(data => {
      console.log('Clientes obtenidos:', data);  // Asegúrate de que los clientes se reciban correctamente
      this.clientes$.next(data);
    });
}

obtenerVehiculos() {
  this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos`)
    .subscribe(data => {
      console.log('Vehículos obtenidos:', data);  // Verifica que los vehículos se reciban correctamente
      this.vehiculos$.next(data);
    });
}

  obtenerAlquileres() {
    this.http.get<Alquiler[]>(`${this.apiUrl}/alquileres`)
      .subscribe(data => this.alquileres$.next(data));
  }

  // ==========================================
  // CRUD CLIENTES & VEHICULOS (Admin)
  // ==========================================
  crearCliente(cliente: Cliente) {
    this.http.post(`${this.apiUrl}/clientes`, cliente).subscribe({
      next: () => {
        alert('Cliente creado');
        this.obtenerClientes(); // Recargar lista
      },
      error: (e) => alert('Error al crear cliente: ' + e.message)
    });
  }

  eliminarCliente(id: string) {
    this.http.delete(`${this.apiUrl}/clientes/${id}`).subscribe(() => this.obtenerClientes());
  }

  actualizarCliente(id: string, cliente: Cliente) {
    this.http.put(`${this.apiUrl}/clientes/${id}`, cliente).subscribe({
      next: () => {
        alert('Cliente actualizado correctamente');
        this.obtenerClientes(); // Refrescar la lista en pantalla
      },
      error: (e) => alert('Error al actualizar cliente: ' + e.message)
    });
  }

  crearVehiculo(vehiculo: Vehiculo) {
    this.http.post(`${this.apiUrl}/vehiculos`, vehiculo).subscribe(() => {
      alert('Vehículo creado');
      this.obtenerVehiculos();
    });
  }

  eliminarVehiculo(codigo: string) {
    this.http.delete(`${this.apiUrl}/vehiculos/${codigo}`).subscribe(() => {
        alert('Vehículo eliminado');
        this.obtenerVehiculos(); // Recargar la lista de vehículos
    }, (error) => {
        alert('Error al eliminar vehículo: ' + error.message);
    });
}

actualizarVehiculo(codigo: string, vehiculo: Vehiculo) {
    // Nota: El backend espera que busques por 'codigo' en la URL
    this.http.put(`${this.apiUrl}/vehiculos/${codigo}`, vehiculo).subscribe({
      next: () => {
        alert('Vehículo actualizado correctamente');
        this.obtenerVehiculos(); // Refrescar la lista en pantalla
      },
      error: (e) => alert('Error al actualizar vehículo: ' + e.message)
    });
  }

  // ==========================================
  // LÓGICA DE NEGOCIO: ALQUILER
  // ==========================================

// Modifica este método:
crearAlquiler(datosAlquiler: any): void {
  // Ya no recibimos parámetros sueltos, sino el objeto completo calculado
  this.http.post(`${this.apiUrl}/alquileres`, datosAlquiler).subscribe({
    next: (respuesta) => {
      console.log('Alquiler creado:', respuesta);
      alert('✅ Alquiler registrado con éxito');
      
      // Actualizamos las listas para que se vea reflejado al instante
      this.obtenerAlquileres();
      this.obtenerVehiculos(); // Para que el vehículo pase a "ALQUILADO" en la lista
    },
    error: (err) => {
      console.error(err);
      alert('❌ Error: ' + (err.error?.msg || err.message));
    }
  });
}

  // ==========================================
  // LÓGICA DE NEGOCIO: DEVOLUCIÓN
  // ==========================================
  procesarDevolucion(alquilerId: string, fechaReal: Date): Observable<any> {
  const alquiler = this.alquileres$.getValue().find(a => a._id === alquilerId);
  if (!alquiler) {
    throw new Error('Alquiler no encontrado');
  }

  // Calcular Mora (Podríamos hacerlo en backend, pero si ya tienes la lógica aquí, enviémosla)
  const fTentativa = new Date(alquiler.fechaTentativa);
  const fReal = new Date(fechaReal);
  
  // Necesitamos la tarifa del vehículo para calcular multa
  const vehiculo = this.vehiculos$.getValue().find(v => v.codigo === alquiler.vehiculoCodigo);
  let diasMora = 0;
  let multa = 0;

  if (fReal.getTime() > fTentativa.getTime()) {
    diasMora = Math.ceil((fReal.getTime() - fTentativa.getTime()) / (1000 * 3600 * 24));
    if (vehiculo) multa = (vehiculo.tarifaDia * 0.10) * diasMora;
  }

  const payload = {
    fechaDevolucionReal: fReal,
    diasMora,
    multa
  };

  return this.http.put(`${this.apiUrl}/alquileres/finalizar/${alquilerId}`, payload);
}


  // ==========================================
  // REPORTES (Consumen tus 5 endpoints nuevos)
  // ==========================================
  
  getClientesRecurrentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/clientes-recurrentes`);
  }

  getVehiculosPopulares(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/vehiculos-populares`);
  }

  getDescuentosCompletos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/descuentos-dobles`);
  }

  getTotalRecaudado(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reportes/total-recaudado`);
  }

  getMultasAltas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/multas-altas`);
  }

  // Método extra para eliminar alquiler (Admin)
 eliminarAlquilerAdmin(id: string) {
    if(!confirm('¿Estás seguro de eliminar este alquiler? Se liberará el vehículo asociado.')) return;

    this.http.delete(`${this.apiUrl}/alquileres/${id}`).subscribe({
      next: () => {
        alert('Alquiler eliminado');
        this.obtenerAlquileres(); // Actualizar lista de alquileres
        this.obtenerVehiculos();  // Importante: Actualizar vehículos porque uno se liberó
      },
      error: (e) => alert('Error al eliminar alquiler: ' + e.message)
    });
  }
}
