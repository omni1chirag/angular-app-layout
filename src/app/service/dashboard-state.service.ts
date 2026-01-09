import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private readonly reloadSubject = new BehaviorSubject<boolean>(null);
  reload$ = this.reloadSubject.asObservable();

  triggerReload(value: boolean): void {
    this.reloadSubject.next(value);
  }
}
