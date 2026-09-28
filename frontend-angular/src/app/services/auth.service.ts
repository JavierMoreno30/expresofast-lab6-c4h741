import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface LoginResponse {
    token: string;
    username: string;
    roles: string[];
    expirationTime: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly loginUrl = 'http://localhost:8080/api/auth/login';

    login(username: string, password: string) {
        return this.http.post<LoginResponse>(this.loginUrl, { username, password });
    }

    guardarSesion(respuesta: LoginResponse): void {
        sessionStorage.setItem('jwt_token', respuesta.token);
        sessionStorage.setItem('jwt_username', respuesta.username);
        sessionStorage.setItem('jwt_roles', JSON.stringify(respuesta.roles));
    }

    getToken(): string | null {
        return sessionStorage.getItem('jwt_token');
    }

    getUsername(): string | null {
        return sessionStorage.getItem('jwt_username');
    }

    estaAutenticado(): boolean {
        return !!this.getToken();
    }

    cerrarSesion(): void {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}