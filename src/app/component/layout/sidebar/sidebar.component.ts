import { Component } from '@angular/core';
import { MenuComponent } from '@component/layout/menu/menu.component';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MenuComponent],
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

}
