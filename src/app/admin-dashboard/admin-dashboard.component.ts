import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../service/layout.service';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ClientService } from '../service/client.service';
import { Router, RouterModule } from '@angular/router';

export interface Client {
  id: string;
  name: string;
  type: string;
  specialty?: string;
  contactNumber: string;
  email: string;
  address: string;
  registeredOn: Date;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [ButtonModule, CardModule, ToggleSwitchModule, FormsModule, ChartModule, SelectModule, TableModule,CommonModule, RouterModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  checked: boolean = true;
  chartData: any;
  chartOptions: any;
  subscription!: Subscription;
  timeOptions: any[] = [
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last Year', value: 'lastYear' },
    {label: 'Annually', value: 'Annually'}
  ];
  selectedTime ={label: 'Last Week', value: 'lastWeek'};
  documentStyle: any;
  clients!: Client[];

  constructor(public layoutService: LayoutService, private clientService: ClientService, private router: Router) {
    this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
      this.initChart();
    });
  }



  ngOnInit() {
    this.clientService.getClientSmall().then((data) => (this.clients = data));
    this.initChart();

  }

  initChart() {

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return; // Prevents errors in SSR or non-browser environments
    }
    this.documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle.getPropertyValue('--text-color');
    const borderColor = this.documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = this.documentStyle.getPropertyValue('--text-color-secondary');

    this.chartData = {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [
        {
          label: 'Weekly Revenue',
          data: [8000, 9200, 11000, 8500, 9700, 10200, 11500], // More consistent revenue
          backgroundColor: this.documentStyle.getPropertyValue('--p-primary-200'),
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
          barThickness: 32
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textMutedColor
          },
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: textMutedColor
          },
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          }
        }
      }
    };
  }

  updateChartData(event: any) {
    const selectedTime = event.value.value;
  
    switch (selectedTime) {
      case 'lastWeek':
        this.chartData = {
          labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          datasets: [
            {
              label: 'Weekly Revenue',
              data: [8000, 9200, 11000, 8500, 9700, 10200, 11500], // More consistent revenue
              backgroundColor: this.documentStyle.getPropertyValue('--p-primary-200'),
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 0,
                bottomRight: 0
              },
              borderSkipped: false,
              barThickness: 32
            }
          ]
        };
        break;
  
      case 'lastMonth':
        this.chartData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Monthly Revenue',
              data: [32000, 29500, 31000, 34500], // Based on weekly revenue
              backgroundColor: this.documentStyle.getPropertyValue('--p-primary-200'),
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 0,
                bottomRight: 0
              },
              borderSkipped: false,
              barThickness: 32
            }
          ]
        };
        break;
  
      case 'lastYear':
        this.chartData = {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Quarterly Revenue',
              data: [96000, 102000, 115000, 125000], // Scaling up from monthly
              backgroundColor: this.documentStyle.getPropertyValue('--p-primary-200'),
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 0,
                bottomRight: 0
              },
              borderSkipped: false,
              barThickness: 32
            }
          ]
        };
        break;
  
      case 'Annually':
        this.chartData = {
          labels: ['2020', '2021', '2022', '2023', '2024'],
          datasets: [
            {
              label: 'Annual Revenue',
              data: [380000, 420000, 480000, 520000, 580000], // Scaling up from quarterly
              backgroundColor: this.documentStyle.getPropertyValue('--p-primary-200'),
              borderRadius: {
                topLeft: 8,
                topRight: 8,
                bottomLeft: 0,
                bottomRight: 0
              },
              borderSkipped: false,
              barThickness: 32
            }
          ]
        };
        break;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
}







