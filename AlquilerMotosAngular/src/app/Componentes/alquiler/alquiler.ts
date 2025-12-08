// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-alquiler',
//   imports: [],
//   templateUrl: './alquiler.html',
//   styleUrl: './alquiler.css',
// })
// export class Alquiler {

// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { Observable } from 'rxjs';
import { Cliente } from '../../Entidades/cliente';
import { Vehiculo } from '../../Entidades/vehiculo';

@Component({
  selector: 'app-alquiler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alquiler.html',
  styleUrl: './alquiler.css'
})
export class Alquiler implements OnInit {

  // Variables para el formulario
  // Inicializamos en null para que el select muestre la opción por defecto
  clienteId: string | null = null; 
  vehiculoCod: string | null = null;
  fInicio: string = '';
  fTentativa: string = '';
  mensaje: string = '';

  // Observables para usar con el pipe async en el HTML
  clientes$!: Observable<Cliente[]>;
  vehiculos$!: Observable<Vehiculo[]>;

  constructor(private service: EcoMoveService) {}

  ngOnInit() {
    // Conectamos con los BehaviorSubjects del servicio
    this.clientes$ = this.service.clientes$;
    this.vehiculos$ = this.service.vehiculos$;
    
    // Recargar datos por si acaso no se cargaron al inicio
    this.service.obtenerClientes();
    this.service.obtenerVehiculos();
  }

  registrar() {
    // 1. Validaciones locales
    if (!this.clienteId || !this.vehiculoCod) {
      this.mensaje = "⚠️ Seleccione un cliente y un vehículo.";
      return;
    }

    if (!this.fInicio || !this.fTentativa) {
      this.mensaje = "⚠️ Ingrese ambas fechas.";
      return;
    }

    const fechaIni = new Date(this.fInicio);
    const fechaFin = new Date(this.fTentativa);

    if (fechaIni > fechaFin) {
      this.mensaje = "⚠️ La fecha de devolución debe ser posterior al inicio.";
      return;
    }

    // 2. Llamar al servicio
    // Nota: El servicio maneja la suscripción HTTP y las alertas (alert) internamente.
    this.service.crearAlquiler(
      this.clienteId, 
      this.vehiculoCod, 
      fechaIni, 
      fechaFin
    );

    // 3. Limpiar formulario si se desea, o esperar a ver si el servicio dio error.
    this.mensaje = "Procesando solicitud...";
    
    // Opcional: Resetear formulario después de un tiempo si fue exitoso
    setTimeout(() => {
        this.mensaje = ''; 
        // Aquí podrías limpiar los campos si quisieras
    }, 2000);
  }
}
