import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebsocketService } from '@service/notification-websocket.service';
import { ScriptLoaderService } from '@service/script-loader.service';
import { ToastModule } from 'primeng/toast';
import { ExternalJS } from './utils/external-js.loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'omnihealth-india-patient-ui';

  // Don't remove this notification object — it is helps to reconnect the WebSocket on refresh
  private readonly notificationWebsocketService = inject(NotificationWebsocketService);
  
  private readonly scriptLoader = inject(ScriptLoaderService);
  
  constructor() {
    this.scriptLoader.loadScripts(ExternalJS.JsUrls);
  }
}
