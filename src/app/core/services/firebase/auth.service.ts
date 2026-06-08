import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  authState,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User
} from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

import { AppUser, AppUserRole } from '../../models/app-user.model';

type ReadyResolver = {
  predicate: () => boolean;
  resolve: () => void;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly readyResolvers = new Set<ReadyResolver>();
  private authStateVersion = 0;

  readonly currentFirebaseUser = signal<User | null>(null);
  readonly currentAppUser = signal<AppUser | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => this.currentFirebaseUser() !== null);
  readonly isTherapistOrAdmin = computed(() => {
    const role = this.currentAppUser()?.role;

    return role === 'therapist' || role === 'admin';
  });

  constructor() {
    const subscription = authState(this.auth).subscribe({
      next: (user) => void this.handleAuthStateChange(user),
      error: () => {
        this.authStateVersion++;
        this.currentFirebaseUser.set(null);
        this.currentAppUser.set(null);
        this.markReady(true);
      }
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  async login(email: string, password: string): Promise<void> {
    this.loading.set(true);

    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.waitForFirebaseUser(credential.user.uid);
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.currentFirebaseUser()) {
      this.currentAppUser.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    try {
      await signOut(this.auth);
      await this.waitForFirebaseUser(null);
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  forgotPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  waitForSession(): Promise<void> {
    return this.waitForReady(() => !this.loading());
  }

  private waitForFirebaseUser(uid: string | null): Promise<void> {
    return this.waitForReady(() => {
      const currentUid = this.currentFirebaseUser()?.uid ?? null;

      return !this.loading() && currentUid === uid;
    });
  }

  private waitForReady(predicate: () => boolean): Promise<void> {
    if (predicate()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.readyResolvers.add({ predicate, resolve });
    });
  }

  private async handleAuthStateChange(firebaseUser: User | null): Promise<void> {
    const version = ++this.authStateVersion;

    this.loading.set(true);
    this.currentFirebaseUser.set(firebaseUser);
    this.currentAppUser.set(null);

    if (!firebaseUser) {
      this.markReady();
      return;
    }

    try {
      const appUser = await this.loadAppUser(firebaseUser);

      if (version === this.authStateVersion) {
        this.currentAppUser.set(appUser);
      }
    } catch {
      if (version === this.authStateVersion) {
        this.currentAppUser.set(null);
      }
    } finally {
      if (version === this.authStateVersion) {
        this.markReady();
      }
    }
  }

  private async loadAppUser(firebaseUser: User): Promise<AppUser | null> {
    const snapshot = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as Partial<AppUser> & Record<string, unknown>;

    return {
      id: snapshot.id,
      displayName: this.readString(data['displayName']) ?? firebaseUser.displayName ?? undefined,
      email: this.readString(data['email']) ?? firebaseUser.email ?? undefined,
      role: this.readRole(data['role']),
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt']
    };
  }

  private markReady(resolveAll = false): void {
    this.loading.set(false);

    this.readyResolvers.forEach((resolver) => {
      if (resolveAll || resolver.predicate()) {
        this.readyResolvers.delete(resolver);
        resolver.resolve();
      }
    });
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private readRole(value: unknown): AppUserRole | undefined {
    return value === 'admin' || value === 'therapist' || value === 'user' ? value : undefined;
  }
}
