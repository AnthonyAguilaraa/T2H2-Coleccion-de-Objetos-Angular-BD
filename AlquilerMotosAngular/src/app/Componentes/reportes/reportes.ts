// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-reportes',
//   imports: [],
//   templateUrl: './reportes.html',
//   styleUrl: './reportes.css',
// })
// export class Reportes {

// }

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoMoveService } from '../../Servicios/eco-move.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {

  // Variables para almacenar los datos "desempaquetados"
  totalDinero: number = 0;
  recurrentes: any[] = [];
  populares: any[] = [];
  multas: any[] = [];
  
  // Estado de carga
  cargando: boolean = false;

  private service = inject(EcoMoveService);

  ngOnInit() {
    this.actualizar();
  }

  actualizar() {
    this.cargando = true;

    // 1. Total Recaudado
    this.service.getTotalRecaudado().subscribe({
      next: (data: any) => {
        // Dependiendo de cómo lo devuelva tu backend (json o número directo)
        // Asumimos que devuelve objeto { total: 1000 } o directo 1000
        this.totalDinero = data.total !== undefined ? data.total : data;
      },
      error: () => this.totalDinero = 0
    });

    // 2. Clientes Recurrentes
    this.service.getClientesRecurrentes().subscribe(data => this.recurrentes = data);

    // 3. Vehículos Populares
    this.service.getVehiculosPopulares().subscribe(data => this.populares = data);

    // 4. Multas Altas (Para control)
    this.service.getMultasAltas().subscribe(data => {
      this.multas = data;
      this.cargando = false; // Finaliza carga
    });
  }
}
