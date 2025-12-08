import { Component, OnInit } from '@angular/core';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alquiler-resumen',
  imports: [CommonModule, FormsModule],
  templateUrl: './alquiler-resumen.html',
  styleUrl: './alquiler-resumen.css',
})
export class AlquilerResumen implements OnInit {

  // Variables para almacenar la información del alquiler
  clienteId!: string;
  vehiculoCod!: string;
  fInicio!: string;
  fTentativa!: string;

  mensaje = '';

  clientes$;
  vehiculos$;

  resumen: any = null;

  constructor(private service: EcoMoveService) {
    this.clientes$ = this.service.clientes$;
    this.vehiculos$ = this.service.vehiculos$;
  }

  ngOnInit() {
    // Cargar los datos de clientes y vehículos al inicio
    this.service.obtenerClientes();
    this.service.obtenerVehiculos();
  }

  // Función para calcular el resumen del alquiler
  calcularResumen() {
    if (!this.clienteId || !this.vehiculoCod || !this.fInicio || !this.fTentativa) {
      this.resumen = null;
      return;
    }

    // Buscar cliente y vehículo por ID y código
    const cliente = this.service.clientes$.getValue().find(c => c._id === this.clienteId);
    const vehiculo = this.service.vehiculos$.getValue().find(v => v.codigo === this.vehiculoCod);

    if (!cliente || !vehiculo) {
      this.resumen = null;
      return;
    }

    // Calcular la cantidad de días de alquiler
    const f1 = new Date(this.fInicio);
    const f2 = new Date(this.fTentativa);
    const dias = Math.max(1, Math.ceil((f2.getTime() - f1.getTime()) / (1000 * 3600 * 24)));

    // Calcular el importe base del alquiler
    const importe = dias * vehiculo.tarifaDia;

    // Descuento extendido por más de 5 días
    const descExtendido = dias > 5 ? importe * 0.15 : 0;
    const subtotal = importe - descExtendido;

    // Descuento por cliente frecuente
    const descFrecuente = cliente.esFrecuente ? subtotal * 0.10 : 0;

    // Depósito del alquiler
    const deposito = importe * 0.12;

    // Total a pagar
    const total = importe - descExtendido - descFrecuente + deposito;

    // Asignar el resumen calculado
    this.resumen = {
      cliente: cliente.nombre,
      vehiculo: vehiculo.nombre,
      dias,
      importe,
      descExtendido,
      descFrecuente,
      deposito,
      total
    };
  }

  // Función para registrar el alquiler en el sistema
  registrar() {
    if (!this.clienteId || !this.vehiculoCod) {
      this.mensaje = "Seleccione cliente y vehículo";
      return;
    }
    if (!this.fInicio || !this.fTentativa) {
      this.mensaje = "Ingrese las fechas";
      return;
    }

    // Crear el alquiler en el backend
    this.service.crearAlquiler(
      this.clienteId,
      this.vehiculoCod,
      new Date(this.fInicio),
      new Date(this.fTentativa)
    );

    // Limpiar formulario y mostrar mensaje de procesamiento
    this.mensaje = "Procesando...";
    this.resumen = null;
  }
}