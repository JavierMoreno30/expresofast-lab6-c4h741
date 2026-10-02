import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { EnvioService } from '../services/envio.service';

//validadro sincrono, validación cruzada
export const fechasValidas: ValidatorFn = (group) => {
  const despacho = group.get('fechaDespacho')?.value;
  const entrega = group.get('fechaEntregaEstimada')?.value;

  if (!despacho || !entrega) {
    return null; //los campos vacíos ya los cubre Validators.required
  }

  const entregaMs = new Date(entrega).getTime();
  const despachoMs = new Date(despacho).getTime();

  return entregaMs > despachoMs ? null : { fechasInvalidas: true };
};

//validador asincrono: consulta al backend si el tracking ya existe
export function trackingUnicoValidator(envioService: EnvioService): AsyncValidatorFn {
  return (control) => {
    const codigo = control.value as string;

    if (!codigo) {
      return of(null);
    }

    //timer(400) funciona como debounce: si el usuario sigue escribiendo,
    //angular cancela esta suscripción antes de que se haga la petición
    return timer(400).pipe(
      switchMap(() => envioService.existeTracking(codigo)),
      map((existe) => (existe ? { trackingTomado: true } : null)),
      catchError(() => of(null)) //si la API falla, el backend igual valida al guardar
    );
  };
}