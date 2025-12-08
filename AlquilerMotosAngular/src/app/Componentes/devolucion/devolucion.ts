// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-devolucion',
//   imports: [],
//   templateUrl: './devolucion.html',
//   styleUrl: './devolucion.css',
// })
// export class Devolucion {

// }

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devolucion.html',
  styleUrl: './devolucion.css'
})
export class Devolucion implements OnInit {

  // Usaremos un Observable para la lista
  alquileres$!: Observable<any[]>;
  private service = inject(EcoMoveService);

  ngOnInit() {
    // Obtenemos los datos frescos
    this.service.obtenerAlquileres();
    
    // Asignamos el observable
    this.alquileres$ = this.service.alquileres$;
  }

  devolver(id: string) {
    if(confirm("¿Confirmar recepción del vehículo y finalizar alquiler?")) {
      // Enviamos la fecha actual como fecha de devolución
      this.service.procesarDevolucion(id, new Date());
    }
  }

  // Helper para saber si ya se pasó de fecha (Solo visual)
  esTardio(fechaTentativa: string): boolean {
    return new Date() > new Date(fechaTentativa);
  }

  
}
