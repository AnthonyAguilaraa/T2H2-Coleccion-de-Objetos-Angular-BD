import { Component, inject } from '@angular/core';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../Entidades/cliente';

@Component({
  selector: 'app-administrar',
  imports: [CommonModule, FormsModule],
  templateUrl: './administrar.html',
  styleUrl: './administrar.css',
})
export class Administrar {

  private service = inject(EcoMoveService);

  vistaActual = 'MENU';
  
  // Datos Observables
  clientes$ = this.service.clientes$;
  vehiculos$ = this.service.vehiculos$;
  alquileres$ = this.service.alquileres$;

  // --- VARIABLES PARA MODO EDICIÓN ---
  editandoCliente = false;
  clienteIdSeleccionado: string | null = null; // Guardamos el _id de Mongo

  editandoVehiculo = false;
  // El código original no se debe editar, sirve de referencia
  vehiculoCodOriginal: string | null = null; 

  // Objetos temporales para el formulario
  formCliente: any = { nombre: '', edad: null, esFrecuente: false };
  formVehiculo: any = { codigo: '', nombre: '', tarifaDia: null, requiereEdad: false, estado: 'DISPONIBLE' };

  ngOnInit() {
    this.service.cargarDatosIniciales();
  }

  cambiarVista(vista: string) {
    this.vistaActual = vista;
    this.cancelarEdicion(); // Limpiar formularios al cambiar de pestaña
  }

  // ==========================================
  // CRUD CLIENTES (FULL)
  // ==========================================
  
  // 1. Cargar datos en el formulario para editar
  cargarClienteParaEditar(cliente: any) {
    this.editandoCliente = true;
    this.clienteIdSeleccionado = cliente._id;
    // Copiamos los datos para no modificar la lista directamente hasta guardar
    this.formCliente = { ...cliente }; 
  }

  // 2. Guardar (Decide si crea o actualiza)
  guardarCliente() {
    if (!this.formCliente.nombre || !this.formCliente.edad) return alert("Datos incompletos");

    if (this.editandoCliente && this.clienteIdSeleccionado) {
      // UPDATE
      this.service.actualizarCliente(this.clienteIdSeleccionado, this.formCliente);
    } else {
      // CREATE
      this.service.crearCliente(this.formCliente);
    }
    this.cancelarEdicion();
  }

  eliminarCliente(id: string) {
    if(confirm('¿Borrar cliente?')) this.service.eliminarCliente(id);
  }

  cancelarEdicion() {
    this.editandoCliente = false;
    this.clienteIdSeleccionado = null;
    this.formCliente = { nombre: '', edad: null, esFrecuente: false };
    
    this.editandoVehiculo = false;
    this.vehiculoCodOriginal = null;
    this.formVehiculo = { codigo: '', nombre: '', tarifaDia: null, requiereEdad: false, estado: 'DISPONIBLE' };
  }

  // ==========================================
  // CRUD VEHICULOS (FULL)
  // ==========================================

  cargarVehiculoParaEditar(vehiculo: any) {
    this.editandoVehiculo = true;
    this.vehiculoCodOriginal = vehiculo.codigo;
    this.formVehiculo = { ...vehiculo };
  }

  guardarVehiculo() {
    if (!this.formVehiculo.codigo || !this.formVehiculo.nombre) return alert("Datos incompletos");

    if (this.editandoVehiculo && this.vehiculoCodOriginal) {
      // UPDATE
      this.service.actualizarVehiculo(this.vehiculoCodOriginal, this.formVehiculo);
    } else {
      // CREATE
      this.service.crearVehiculo(this.formVehiculo);
    }
    this.cancelarEdicion();
  }

  eliminarVehiculo(cod: string) {
    if(confirm('¿Borrar vehículo?')) this.service.eliminarVehiculo(cod);
  }

  // ==========================================
  // ALQUILERES (ADMIN)
  // ==========================================
  eliminarAlquiler(id: string) {
    this.service.eliminarAlquilerAdmin(id);
  }

  getClienteNombre(clienteId: string | Cliente): string {
  if (typeof clienteId === 'string') {
    return 'Desconocido';  // o puedes manejar el caso cuando sea solo un string
  }
  return clienteId.nombre || 'Desconocido';
}

}
