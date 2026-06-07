import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { therapistRoleGuard } from './core/guards/therapist-role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { NotesPageComponent } from './features/notes/notes-page.component';
import { PatientDetailsPageComponent } from './features/patients/patient-details-page.component';
import { PatientListPageComponent } from './features/patients/patient-list-page.component';
import { ReflectionTemplatesPageComponent } from './features/reflection-templates/reflection-templates-page.component';
import { SettingsPageComponent } from './features/settings/settings-page.component';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard, therapistRoleGuard],
    canActivateChild: [authGuard, therapistRoleGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent
      },
      {
        path: 'patients',
        component: PatientListPageComponent
      },
      {
        path: 'patients/:id',
        component: PatientDetailsPageComponent
      },
      {
        path: 'notes',
        component: NotesPageComponent
      },
      {
        path: 'templates',
        component: ReflectionTemplatesPageComponent
      },
      {
        path: 'settings',
        component: SettingsPageComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
