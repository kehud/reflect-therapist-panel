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
  auth: {
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'therapist@example.com',
    passwordPlaceholder: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    forgotPassword: 'Forgot password?',
    sendingReset: 'Sending reset...',
    resetSent: 'Password reset email sent.',
    missingCredentials: 'Enter email and password.',
    missingEmail: 'Enter your email first.',
    invalidEmail: 'Enter a valid email address.',
    invalidCredentials: 'Email or password is incorrect.',
    accessDenied: 'This account cannot access the therapist panel.',
    tooManyRequests: 'Too many attempts. Please try again later.',
    networkError: 'Network error. Please try again.',
    genericError: 'Something went wrong. Please try again.',
    logoutError: 'Could not log out. Please try again.'
  },
  shell: {
    workspace: 'MVP workspace',
    role: 'Therapist/Admin',
    signedIn: 'Signed in'
  },
  roles: {
    admin: 'Admin',
    therapist: 'Therapist',
    user: 'User'
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
