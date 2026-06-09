export const APP_LABELS = {
  appName: 'Reflect Therapist Panel',
  common: {
    loading: 'Loading...',
    firestoreError: 'Could not load Firebase data.',
    loadMore: 'Load more'
  },
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
  },
  dashboard: {
    overview: 'Overview',
    totalPatients: 'Total patients',
    moodEntries: 'Mood entries',
    needsAttention: 'Patients requiring attention',
    attentionDescription: 'Patients with high or medium attention level.',
    attentionList: 'Needs attention',
    noAttention: 'No patients need attention right now.',
    latestMood: 'Latest mood',
    recentMoodEntries: 'Recent mood entries',
    noMoodEntries: 'No mood entries yet.',
    noLatestMood: 'No mood recorded',
    viewPatients: 'View patients',
    patientsDescription: 'Open the Firestore-backed patient list.',
    lastRecorded: 'Last recorded'
  },
  patients: {
    subtitle: 'Read-only list of patient users from Firestore.',
    patient: 'Patient',
    latestMood: 'Latest mood',
    lastEntry: 'Last entry',
    entries: 'Entries',
    status: 'Status',
    noPatients: 'No patients found.',
    noMood: 'No mood recorded',
    noEntries: 'No entries',
    unknownPatient: 'Unknown patient'
  },
  attention: {
    title: 'Needs attention',
    level: 'Level',
    reasons: 'Reasons',
    none: 'NONE',
    medium: 'MEDIUM',
    high: 'HIGH',
    noReasons: 'No attention reasons.'
  },
  patientDetails: {
    email: 'Email',
    role: 'Role',
    latestMood: 'Latest mood',
    lastCheckIn: 'Last check-in',
    moodTrend: 'Mood trend',
    lastTenMoodEntries: 'Last 10 entries',
    noMoodTrend: 'No mood trend yet.',
    moodHistory: 'Mood history',
    moodLevel: 'Mood level',
    emotions: 'Emotions',
    influences: 'Influences',
    journalNote: 'Journal note',
    noPatient: 'Patient not found.',
    noMoodEntries: 'No mood entries found for this patient.',
    none: 'None',
    therapistNotes: 'Therapist notes',
    noTherapistNotes: 'No therapist notes yet.',
    notePlaceholder: 'Write a private therapist note...',
    saveNote: 'Save note',
    savingNote: 'Saving...',
    emptyNoteError: 'Enter a note before saving.',
    saveNoteError: 'Could not save note. Please try again.'
  },
  templates: {
    subtitle: 'Read-only active reflection templates from Firestore.',
    totalTemplates: 'Total templates',
    activeTemplates: 'Active templates',
    search: 'Search templates',
    searchPlaceholder: 'Search title, body, or type',
    type: 'Type',
    minCheckins: 'Minimum check-ins',
    noTemplates: 'No active templates found.',
    noSearchResults: 'No templates match your search.',
    untitled: 'Untitled template',
    noBody: 'No body text.'
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
