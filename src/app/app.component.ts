import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebsocketService } from '@service/notification-websocket.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'omnihealth-india-patient-ui';

  constructor(
    // Don't remove this notification object — it is helps to reconnect the WebSocket on refresh
    private notificationWebsocketService: NotificationWebsocketService
  ) {
  }
}
