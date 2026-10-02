import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { EnvioService } from '../../services/envio.service';
import { fechasValidas, trackingUnicoValidator } from '../../validators/envio.validators';

type PaqueteForm = FormGroup<{
  descripcion: FormControl<string>;
  pesoKg: FormControl<number>;
}>;

@Component({
  selector: 'app-envio-avanzado-form',
  imports: [ReactiveFormsModule],
  styleUrls: ['../envio-form/envio-form.css', './envio-avanzado-form.css'],
  templateUrl: './envio-avanzado-form.html',
})
export class EnvioAvanzadoForm {
  private fb = inject(NonNullableFormBuilder);
  private envioService = inject(EnvioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group(
    {
      codigoRastreo: [
        '',
        [Validators.required, Validators.pattern(/^EXP-\d{4}$/)],
        [trackingUnicoValidator(this.envioService)]
      ],
      direccionDestino: ['', Validators.required],
      costo: [0, [Validators.required, Validators.min(0.01)]],
      vehiculoId: [1, Validators.required],
      conductorId: [1, Validators.required],
      fechaDespacho: ['', Validators.required],
      fechaEntregaEstimada: ['', Validators.required],
      paquetes: this.fb.array([this.crearPaquete()])
    },
    { validators: fechasValidas }
  );

  mensajeExito = signal('');
  mensajeError = signal('');

  constructor() {
    //Zoneless: el resultado del validador asíncrono llega fuera de un evento,
    //así que hay que avisarle a Angular que repinte
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  get paquetes() {
    return this.form.controls.paquetes;
  }

  private crearPaquete(): PaqueteForm {
    return this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      pesoKg: [0, [Validators.required, Validators.min(0.01), Validators.max(999.99)]]
    });
  }

  agregarPaquete(): void {
    this.paquetes.push(this.crearPaquete());
  }

  quitarPaquete(indice: number): void {
    //siempre debe quedar al menos un paquete
    if (this.paquetes.length > 1) {
      this.paquetes.removeAt(indice);
    }
  }

  onSubmit(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.envioService.crearConPaquetes(payload).subscribe({
      next: () => {
        this.mensajeExito.set(`Envio ${payload.codigoRastreo} registrado correctamente.`);
        setTimeout(() => this.router.navigate(['/envios']), 1200);
      },
      error: (error) => {
        this.mensajeError.set(error?.error?.error || 'No se pudo registrar el envio.');
      }
    });
  }
}