import { Injectable } from '@angular/core';

import { AppUser } from '../../models/app-user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  listPatients(): AppUser[] {
    // TODO: Read patient users from the existing users collection.
    return [];
  }

  getUser(_userId: string): AppUser | null {
    // TODO: Read one user document from the existing users collection.
    return null;
  }
}
