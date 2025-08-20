import { Component, ElementRef } from '@angular/core';
import { MenuComponent } from '@component/layout/menu/menu.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MenuComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(public el: ElementRef) {}

}
