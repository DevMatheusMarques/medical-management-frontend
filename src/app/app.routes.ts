import { Routes } from '@angular/router';
import {AuthComponent} from './components/auth/auth.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {PatientsComponent} from './components/patients/list/patients.component';
import {DoctorsComponent} from './components/doctors/list/doctors.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'patients', component: PatientsComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: '**', redirectTo: '' }
];
