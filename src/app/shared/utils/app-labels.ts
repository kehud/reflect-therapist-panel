export const APP_LABELS = {
  appName: 'Reflect Therapist Panel',
  nav: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    notes: 'Notes',
    templates: 'Templates',
    settings: 'Settings',
    logout: 'Log out'
  },
  pages: {
    loginTitle: 'Therapist sign in',
    loginSubtitle: 'Access patient reflections, mood history, notes, and assignments.',
    dashboardTitle: 'Dashboard',
    patientsTitle: 'Patients',
    patientDetailsTitle: 'Patient details',
    notesTitle: 'Therapist notes',
    templatesTitle: 'Reflection templates',
    settingsTitle: 'Settings'
  },
  shell: {
    workspace: 'MVP workspace',
    role: 'Therapist/Admin'
  }
} as const;

export type AppNavItem = {
  label: string;
  route: string;
  exact?: boolean;
};

export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  {
    label: APP_LABELS.nav.dashboard,
    route: '/dashboard',
    exact: true
  },
  {
    label: APP_LABELS.nav.patients,
    route: '/patients'
  },
  {
    label: APP_LABELS.nav.notes,
    route: '/notes',
    exact: true
  },
  {
    label: APP_LABELS.nav.templates,
    route: '/templates',
    exact: true
  },
  {
    label: APP_LABELS.nav.settings,
    route: '/settings',
    exact: true
  }
];
