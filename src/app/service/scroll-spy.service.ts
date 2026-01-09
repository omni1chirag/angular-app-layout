import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScrollSpyService {

  private readonly activeModuleSubject = new BehaviorSubject<string>('');
  public activeModule$: Observable<string> = this.activeModuleSubject.asObservable();

  setActiveModule(moduleId: string): void {
    this.activeModuleSubject.next(moduleId);
  }
}