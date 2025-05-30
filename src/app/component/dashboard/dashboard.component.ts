import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';


@Component({
  selector: 'app-dashboard',
  imports: [SkeletonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
