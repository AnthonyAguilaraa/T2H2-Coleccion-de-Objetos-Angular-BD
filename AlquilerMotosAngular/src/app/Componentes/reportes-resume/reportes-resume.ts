import { Component, inject } from '@angular/core';
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

  ngOnInit() { // Usar OnInit
    this.actualizar();
  }

  actualizar() {
    this.service.getClientesRecurrentes().subscribe(d => this.clientesMultialquiler = d);
    this.service.getVehiculosPopulares().subscribe(d => this.vehiculosPopulares = d);
    this.service.getDescuentosCompletos().subscribe(d => this.alquileresConDescuentos = d);
    this.service.getMultasAltas().subscribe(d => this.clientesConMultaAlta = d);
    
    // El total viene como objeto { total: 123 }
    this.service.getTotalRecaudado().subscribe((d: any) => this.totalRecaudado = d.total); 
  }
}
