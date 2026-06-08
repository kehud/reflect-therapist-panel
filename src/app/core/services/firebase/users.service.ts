import { inject, Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

import { AppUser, AppUserRole } from '../../models/app-user.model';

type UserDocument = Partial<AppUser> & Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly firestore = inject(Firestore);

  listPatients(): Observable<AppUser[]> {
    const usersRef = collection(this.firestore, 'users');
    const patientsQuery = query(usersRef, where('role', '==', 'user'));

    return collectionData(patientsQuery, { idField: 'id' }).pipe(
      map((users) => {
        return (users as UserDocument[])
          .map((user) => this.toAppUser(user))
          .sort((first, second) => this.getUserLabel(first).localeCompare(this.getUserLabel(second)));
      })
    );
  }

  getUser(userId: string): Observable<AppUser | null> {
    const userRef = doc(this.firestore, 'users', userId);

    return docData(userRef, { idField: 'id' }).pipe(
      map((user) => {
        return user ? this.toAppUser(user as UserDocument) : null;
      })
    );
  }

  private toAppUser(data: UserDocument): AppUser {
    return {
      id: this.readString(data['id']) ?? '',
      displayName: this.readString(data['displayName']),
      email: this.readString(data['email']),
      role: this.readRole(data['role']),
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt']
    };
  }

  private getUserLabel(user: AppUser): string {
    return user.displayName ?? user.email ?? user.id;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  private readRole(value: unknown): AppUserRole | undefined {
    return value === 'admin' || value === 'therapist' || value === 'user' ? value : undefined;
  }
}
