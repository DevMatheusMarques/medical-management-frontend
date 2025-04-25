import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GenericDataService } from './generic-data.service';

@Injectable({ providedIn: 'root' })
export class GenericDataResolver implements Resolve<any> {
  constructor(private dataService: GenericDataService) {}

  resolve(route: any): Observable<any> {
    const endpoint = route.data['endpoint'];
    return this.dataService.get(endpoint);
  }
}
