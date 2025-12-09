import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  
  cargando: boolean = false;

  private service = inject(EcoMoveService);
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.actualizar();
  }

  actualizar() {
    this.cargando = true;  // Indicamos que está cargando

    // 1. Total Recaudado (Backend envía: { totalIngresos: 188.36, ... })
    this.service.getTotalRecaudado().subscribe({
      next: (data: any) => {
        this.totalDinero = data.totalIngresos || 0;
        this.cargando = false;  // Cuando ya tenemos los datos, quitamos el indicador
        this.cdr.detectChanges();  // Forzamos la detección de cambios
      },
      error: () => {
        this.totalDinero = 0;
        this.cargando = false;  // Si hay error, también dejamos de cargar
        this.cdr.detectChanges();  // Forzamos la detección de cambios
      }
    });

    // 2. Clientes Recurrentes (Backend envía array con campo 'cliente' y 'totalAlquileres')
    this.service.getClientesRecurrentes().subscribe({
      next: (data) => {
        this.recurrentes = data;
        this.cdr.detectChanges();  // Aseguramos la detección de cambios
      },
      error: () => {
        this.recurrentes = [];
        this.cdr.detectChanges();  // Aseguramos la detección de cambios
      }
    });

    // 3. Vehículos Populares (Backend envía array con campo 'nombre' y 'vecesAlquilado')
    this.service.getVehiculosPopulares().subscribe({
      next: (data) => {
        this.populares = data;
        this.cdr.detectChanges();  // Aseguramos la detección de cambios
      },
      error: () => {
        this.populares = [];
        this.cdr.detectChanges();  // Aseguramos la detección de cambios
      }
    });

    // 4. Multas Altas
    this.service.getMultasAltas().subscribe({
      next: (data) => {
        this.multas = data;
        this.cargando = false;  // Dejamos de cargar cuando todo se obtiene
        this.cdr.detectChanges();  // Forzamos la detección de cambios
      },
      error: () => {
        this.multas = [];
        this.cargando = false;  // Dejamos de cargar si hay error
        this.cdr.detectChanges();  // Forzamos la detección de cambios
      }
    });
  }
}