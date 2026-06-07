import { Injectable } from '@angular/core';

import { Moment } from '../../models/moment.model';

@Injectable({
  providedIn: 'root'
})
export class MomentsService {
  listForUser(_userId: string): Moment[] {
    // TODO: Read moments from the existing moments collection.
    return [];
  }
}
