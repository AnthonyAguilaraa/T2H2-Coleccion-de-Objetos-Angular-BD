import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { EcoMoveService } from '../../Servicios/eco-move.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-devolucion-resumen',
  imports: [CommonModule, FormsModule],
  templateUrl: './devolucion-resumen.html',
  styleUrl: './devolucion-resumen.css',
})
export class DevolucionResumen implements OnInit {

   private cdr = inject(ChangeDetectorRef);
  alquileres$!: Observable<any[]>;
  private service = inject(EcoMoveService);

  fechaReal!: string;
  resumen: any = null;
  seleccionado: any = null;

  ngOnInit() {
    this.alquileres$ = this.service.alquileres$;

  this.service.obtenerClientes();
  this.service.obtenerVehiculos();
  }

  devolver(a: any) {
    this.seleccionado = a;
    this.fechaReal = "";
    this.resumen = null;
  }

  calcular() {

    if (!this.fechaReal || !this.seleccionado) return;

  const a = this.seleccionado;
  console.log('Alquiler seleccionado:', a);  // Para asegurar que 'clienteId' es un objeto

  const veh = this.service.vehiculos$.getValue()
    .find(v => v.codigo === a.vehiculoCodigo);

  // Acceder correctamente a clienteId._id
  const cliente = this.service.clientes$.getValue()
    .find(c => c._id === a.clienteId._id);  // Modificación aquí

  // VALIDACIÓN NECESARIA
  if (!veh || !cliente) {
    console.error("Vehículo o cliente no encontrado");
    return;
  }

    const fIni = new Date(a.fechaInicio);
    const fTen = new Date(a.fechaTentativa);
    const fDev = new Date(this.fechaReal);

    const dias = Math.ceil((fTen.getTime() - fIni.getTime()) / 86400000);
    const diasMora = Math.max(0, Math.ceil((fDev.getTime() - fTen.getTime()) / 86400000));

    const importe = dias * veh.tarifaDia;

    const descExt = dias > 5 ? importe * 0.15 : 0;
    const sub1 = importe - descExt;
    const descFrecuente = cliente.esFrecuente ? sub1 * 0.10 : 0;

    const deposito = importe * 0.12;

    const multa = diasMora * (veh.tarifaDia * 0.10);

    const depositoDevuelto = Math.max(0, deposito - multa);

    const subtotalFinal =
      importe - descExt - descFrecuente + multa - depositoDevuelto;

    this.resumen = {
      cliente: cliente.nombre,
      vehiculo: veh.nombre,
      dias,
      diasMora,
      importe,
      descExt,
      descFrecuente,
      deposito,
      multa,
      depositoDevuelto,
      subtotalFinal
    };

    console.log("Resumen calculado:", this.resumen);
  }

  confirmar() {
  console.log("Confirmar devolución ejecutada", this.seleccionado, this.fechaReal);
  if (!this.seleccionado || !this.fechaReal) return;

  this.service.procesarDevolucion(this.seleccionado._id, new Date(this.fechaReal)).subscribe({
    next: () => {
      this.resumen = null;
      this.seleccionado = null;

      this.service.obtenerAlquileres();

this.cdr.detectChanges();
      alert("Devolución procesada con éxito");
      console.log("Devolución procesada con éxito");
    },
    error: (err) => {
      console.error("Error al procesar la devolución", err);
      alert("Hubo un error al procesar la devolución. Intenta nuevamente.");
    }
  });
}


}