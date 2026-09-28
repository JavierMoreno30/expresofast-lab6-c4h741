import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    const peticionConToken = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(peticionConToken).pipe(
        catchError((error) => {
            if (error.status === 401 || error.status === 403) {
                authService.cerrarSesion();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};