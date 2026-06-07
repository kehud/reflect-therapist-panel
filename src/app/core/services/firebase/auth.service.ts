import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isSignedIn(): boolean {
    // TODO: Read Firebase auth state.
    return true;
  }

  signInWithEmail(_email: string, _password: string): Promise<void> {
    // TODO: Connect Firebase email/password sign in.
    return Promise.resolve();
  }

  signOut(): Promise<void> {
    // TODO: Connect Firebase sign out.
    return Promise.resolve();
  }
}
