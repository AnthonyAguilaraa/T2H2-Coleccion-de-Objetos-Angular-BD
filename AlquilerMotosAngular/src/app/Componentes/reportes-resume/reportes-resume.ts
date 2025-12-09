import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes-resume',
  imports: [CommonModule],
  templateUrl: './reportes-resume.html',
  styleUrl: './reportes-resume.css',
})
export class ReportesResume {

   // LISTAS A MOSTRAR
  clientesMultialquiler: any[] = [];
  vehiculosPopulares: any[] = [];
  alquileresConDescuentos: any[] = [];
  clientesConMultaAlta: any[] = [];
  totalRecaudado: number = 0;

  private service = inject(EcoMoveService);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.actualizar();
  }

  actualizar() {
    console.log('Iniciando carga de reportes...');
    
    // 1. Clientes Recurrentes
    this.service.getClientesRecurrentes().subscribe({
      next: (data) => {
        console.log('✅ Clientes Recurrentes:', data);
        this.clientesMultialquiler = data;
        this.cdr.detectChanges(); // Detectar cambios manualmente
      },
      error: (err) => console.error('❌ Error Clientes Recurrentes:', err)
    });

    // 2. Vehículos Populares
    this.service.getVehiculosPopulares().subscribe({
      next: (data) => {
        console.log('✅ Vehículos Populares:', data);
        this.vehiculosPopulares = data;
        this.cdr.detectChanges(); // Detectar cambios manualmente
      },
      error: (err) => console.error('❌ Error Vehículos:', err)
    });

    // 3. Descuentos Dobles
    this.service.getDescuentosCompletos().subscribe({
      next: (data) => {
        console.log('✅ Descuentos Dobles:', data);
        this.alquileresConDescuentos = data;
        this.cdr.detectChanges(); // Detectar cambios manualmente
      },
      error: (err) => console.error('❌ Error Descuentos:', err)
    });

    // 4. Multas Altas
    this.service.getMultasAltas().subscribe({
      next: (data) => {
        console.log('✅ Multas Altas:', data);
        this.clientesConMultaAlta = data;
        this.cdr.detectChanges(); // Detectar cambios manualmente
      },
      error: (err) => console.error('❌ Error Multas:', err)
    });

    // 5. Total Recaudado
    this.service.getTotalRecaudado().subscribe({
      next: (data: any) => {
        console.log('✅ Total Recaudado RAW:', data);
        this.totalRecaudado = data?.totalIngresos || 0;
        this.cdr.detectChanges(); // Detectar cambios manualmente
      },
      error: (err) => console.error('❌ Error Total:', err)
    });
  }
}
