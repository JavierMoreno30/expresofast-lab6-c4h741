import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { EnvioList } from './components/envio-list/envio-list';
import { EnvioForm } from './components/envio-form/envio-form';
import { EnvioTracking } from './components/envio-tracking/envio-tracking';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'envios', component: EnvioList },
    { path: 'nuevo-envio', component: EnvioForm },
    { path: 'rastreo', component: EnvioTracking },
    { path: '', redirectTo: '/envios', pathMatch: 'full' },
    { path: '**', redirectTo: '/envios' }
];