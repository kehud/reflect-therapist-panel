export const APP_LABELS = {
  appName: 'Reflect Therapist Panel',
  brand: {
    name: 'Reflect',
    subtitle: 'Therapist Panel'
  },
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
    signedIn: 'Signed in',
    primaryNavigation: 'Primary navigation'
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
    noReasons: 'No attention reasons.',
    latestMoodOne: 'Latest mood is 1.',
    lastTwoLow: 'Last 2 check-ins are mood 2 or lower.',
    noCheckIns: 'No check-ins yet',
    staleCheckIn: 'No check-in for 7+ days.'
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
    saveNoteError: 'Could not save note. Please try again.',
    timelineTitle: 'Patient Timeline',
    timelineDescription: 'Mood entries and therapist notes in chronological order.',
    moodCheckIn: 'Mood Check-in',
    therapistNote: 'Therapist Note'
  },
  notes: {
    noNotesYet: 'No notes yet',
    setupDescription: 'The therapistNotes collection will be added after Firebase wiring.'
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
  },
  settings: {
    panelSettings: 'Panel settings',
    panelDescription: 'Choose panel preferences for this device.',
    theme: 'Theme',
    themeDescription: 'Choose how the therapist panel appears on this device.',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    languageDescription: 'Choose the panel language and layout direction.',
    english: 'English',
    hebrew: 'עברית'
  }
} as const;

type WidenLabels<T> = T extends string
  ? string
  : T extends object
    ? {
        [Key in keyof T]: WidenLabels<T[Key]>;
      }
    : T;

export type AppLanguage = 'en' | 'he';
export type AppLabels = WidenLabels<typeof APP_LABELS>;

export const APP_LANGUAGE_LABELS: Record<AppLanguage, AppLabels> = {
  en: APP_LABELS,
  he: {
    ...APP_LABELS,
    appName: 'פאנל מטפלים Reflect',
    brand: {
      ...APP_LABELS.brand,
      subtitle: 'פאנל מטפלים'
    },
    common: {
      ...APP_LABELS.common,
      loading: 'טוען...',
      firestoreError: 'לא ניתן לטעון נתונים מ-Firebase.',
      loadMore: 'טען עוד'
    },
    nav: {
      ...APP_LABELS.nav,
      dashboard: 'לוח בקרה',
      patients: 'מטופלים',
      notes: 'הערות',
      templates: 'תבניות',
      settings: 'הגדרות',
      logout: 'התנתקות'
    },
    pages: {
      ...APP_LABELS.pages,
      loginTitle: 'כניסת מטפל',
      loginSubtitle: 'גישה לרפלקציות, היסטוריית מצב רוח, הערות ומשימות של מטופלים.',
      dashboardTitle: 'לוח בקרה',
      patientsTitle: 'מטופלים',
      patientDetailsTitle: 'פרטי מטופל',
      notesTitle: 'הערות',
      templatesTitle: 'תבניות',
      settingsTitle: 'הגדרות'
    },
    auth: {
      ...APP_LABELS.auth,
      email: 'דוא"ל',
      password: 'סיסמה',
      passwordPlaceholder: 'סיסמה',
      signIn: 'כניסה',
      signingIn: 'נכנס...',
      forgotPassword: 'שכחת סיסמה?',
      sendingReset: 'שולח איפוס...',
      resetSent: 'נשלח מייל לאיפוס סיסמה.',
      missingCredentials: 'יש להזין דוא"ל וסיסמה.',
      missingEmail: 'יש להזין דוא"ל תחילה.',
      invalidEmail: 'יש להזין כתובת דוא"ל תקינה.',
      invalidCredentials: 'הדוא"ל או הסיסמה שגויים.',
      accessDenied: 'לחשבון זה אין גישה לפאנל המטפלים.',
      tooManyRequests: 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.',
      networkError: 'שגיאת רשת. נסו שוב.',
      genericError: 'משהו השתבש. נסו שוב.',
      logoutError: 'לא ניתן להתנתק. נסו שוב.'
    },
    shell: {
      ...APP_LABELS.shell,
      workspace: 'סביבת MVP',
      role: 'מטפל/מנהל',
      signedIn: 'מחובר',
      primaryNavigation: 'ניווט ראשי'
    },
    roles: {
      ...APP_LABELS.roles,
      admin: 'מנהל',
      therapist: 'מטפל',
      user: 'משתמש'
    },
    dashboard: {
      ...APP_LABELS.dashboard,
      overview: 'סקירה',
      totalPatients: 'סה"כ מטופלים',
      moodEntries: 'רשומות מצב רוח',
      needsAttention: 'מטופלים הדורשים תשומת לב',
      attentionDescription: 'מטופלים עם רמת תשומת לב גבוהה או בינונית.',
      attentionList: 'דורש תשומת לב',
      noAttention: 'אין מטופלים הדורשים תשומת לב כרגע.',
      latestMood: 'מצב רוח אחרון',
      recentMoodEntries: 'רשומות מצב רוח אחרונות',
      noMoodEntries: 'אין עדיין רשומות מצב רוח.',
      noLatestMood: 'לא תועד מצב רוח',
      viewPatients: 'הצג מטופלים',
      patientsDescription: 'פתיחת רשימת המטופלים מ-Firestore.',
      lastRecorded: 'תועד לאחרונה'
    },
    patients: {
      ...APP_LABELS.patients,
      subtitle: 'רשימת מטופלים לקריאה בלבד מ-Firestore.',
      patient: 'מטופל',
      latestMood: 'מצב רוח אחרון',
      lastEntry: 'רשומה אחרונה',
      entries: 'רשומות',
      status: 'סטטוס',
      noPatients: 'לא נמצאו מטופלים.',
      noMood: 'לא תועד מצב רוח',
      noEntries: 'אין רשומות',
      unknownPatient: 'מטופל לא ידוע'
    },
    attention: {
      ...APP_LABELS.attention,
      title: 'דורש תשומת לב',
      level: 'רמה',
      reasons: 'סיבות',
      none: 'ללא',
      medium: 'בינונית',
      high: 'גבוהה',
      noReasons: 'אין סיבות לתשומת לב.',
      latestMoodOne: 'מצב הרוח האחרון הוא 1.',
      lastTwoLow: 'שני הצ׳ק-אינים האחרונים הם 2 ומטה.',
      noCheckIns: 'אין עדיין צ׳ק-אינים',
      staleCheckIn: 'לא היה צ׳ק-אין במשך 7 ימים ומעלה.'
    },
    patientDetails: {
      ...APP_LABELS.patientDetails,
      email: 'דוא"ל',
      role: 'תפקיד',
      latestMood: 'מצב רוח אחרון',
      lastCheckIn: 'צ׳ק-אין אחרון',
      moodTrend: 'מגמת מצב רוח',
      lastTenMoodEntries: '10 הרשומות האחרונות',
      noMoodTrend: 'אין עדיין מגמת מצב רוח.',
      moodHistory: 'היסטוריית מצב רוח',
      moodLevel: 'רמת מצב רוח',
      emotions: 'רגשות',
      influences: 'השפעות',
      journalNote: 'הערת יומן',
      noPatient: 'המטופל לא נמצא.',
      noMoodEntries: 'לא נמצאו רשומות מצב רוח למטופל זה.',
      none: 'אין',
      therapistNotes: 'הערות מטפל',
      noTherapistNotes: 'אין עדיין הערות מטפל.',
      notePlaceholder: 'כתוב הערת מטפל פרטית...',
      saveNote: 'שמור הערה',
      savingNote: 'שומר...',
      emptyNoteError: 'יש להזין הערה לפני השמירה.',
      saveNoteError: 'לא ניתן לשמור הערה. נסו שוב.',
      timelineTitle: 'ציר זמן המטופל',
      timelineDescription: 'רשומות מצב רוח והערות מטפל בסדר כרונולוגי.',
      moodCheckIn: 'צ׳ק-אין מצב רוח',
      therapistNote: 'הערת מטפל'
    },
    notes: {
      ...APP_LABELS.notes,
      noNotesYet: 'אין הערות עדיין',
      setupDescription: 'אוסף therapistNotes יתווסף לאחר חיבור Firebase.'
    },
    templates: {
      ...APP_LABELS.templates,
      subtitle: 'תבניות רפלקציה פעילות לקריאה בלבד מ-Firestore.',
      totalTemplates: 'סה"כ תבניות',
      activeTemplates: 'תבניות פעילות',
      search: 'חיפוש תבניות',
      searchPlaceholder: 'חיפוש כותרת, גוף או סוג',
      type: 'סוג',
      minCheckins: 'מינימום צ׳ק-אינים',
      noTemplates: 'לא נמצאו תבניות פעילות.',
      noSearchResults: 'אין תבניות התואמות לחיפוש.',
      untitled: 'תבנית ללא כותרת',
      noBody: 'אין טקסט גוף.'
    },
    settings: {
      ...APP_LABELS.settings,
      panelSettings: 'הגדרות פאנל',
      panelDescription: 'בחירת העדפות הפאנל במכשיר זה.',
      theme: 'ערכת נושא',
      themeDescription: 'בחירת מראה פאנל המטפלים במכשיר זה.',
      light: 'בהיר',
      dark: 'כהה',
      language: 'שפה',
      languageDescription: 'בחירת שפת הממשק וכיוון התצוגה.',
      english: 'English',
      hebrew: 'עברית'
    }
  }
};

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
