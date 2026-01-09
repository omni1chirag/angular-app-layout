import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { environment } from '@environment/environment';
import { JitsiMeetAPI, JitsiMeetExternalAPIConstructor, JitsiOptions, TeleVideoLogPayload, TelevideoStatusPayload, VideoConferenceEvent } from '@interface/jitsi-interface';
import { AppointmentService } from '@service/appointment.service';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { LocalStorageService } from '@service/local-storage.service';
import { PlatformService } from '@service/platform.service';
import { SessionStorageService } from '@service/session-storage.service';
import { Subscription } from 'rxjs';


declare const JitsiMeetExternalAPI: JitsiMeetExternalAPIConstructor;


@Component({
  selector: 'app-jitsi-integration',
  imports: [],
  templateUrl: './jitsi-integration.component.html',
})
export class JitsiIntegrationComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformService = inject(PlatformService);
  public readonly sessionStorageService = inject(SessionStorageService);
  public readonly localStorageService = inject(LocalStorageService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  isBrowser = false;
  @Input() Roomname = 'OmniVideoTest';
  @Input() width = 1560;
  @Input() height = 922;

  domain = 'televideo.omnimd.com';
  title = 'OmniOne Telemedicien Call Demo';
  options: JitsiOptions | null = null;
  api: JitsiMeetAPI | null = null;
  hideModal: { hide: () => void } | null = null;
  appointmentIdJitsi: string | null = null;
  jwtToken: string | null = null;
  subscription$: Subscription | null = null;
  close = false;
  patientId: string

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.domain = environment.JITSI_URL;
      setTimeout(() => {
        const container = this.el.nativeElement.closest('#container');
        if (container) {

          const header = container.querySelector('header.navbar');
          const sidebar = container.querySelector('aside.sidebar.sidebBarViewIpad');
          const jitsiFrame = container.querySelector('#jitsiConferenceFrame0');
          const contentBody = container.querySelector('main.content-body');

          if (header) {
            this.renderer.setStyle(header, 'display', 'none');
          } else {
            console.error('Header element not found');
          }

          if (sidebar) {
            this.renderer.setStyle(sidebar, 'display', 'none');
          } else {
            console.error('Sidebar element not found');
          }

          if (jitsiFrame) {
            this.renderer.setStyle(jitsiFrame, 'height', '-webkit-fill-available');
          } else {
            console.error('jitsiFrameWork element not found');
          }

          if (contentBody) {
            this.renderer.setStyle(contentBody, 'height', null);
          } else {
            console.error('content-body element not found');
          }

        } else {
          console.error('container element not found');
        }

      }, 0);
      window.addEventListener('beforeunload', this.beforeUnloadMethod.bind(this), true);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.getTokenForAppointment()
      .then(() => {
        const roomName = this.sessionStorageService.getItem<string>('RoomName');
        if (!roomName) {
          console.error('Room name is not available');
          return;
        }

        this.initializeJitsi(roomName);
      })
      .catch((err) => {
        console.error('Error initializing Jitsi:', err);
      });
  }

  private initializeJitsi(roomName: string): void {
    this.options = {
      jwt: this.jwtToken || undefined,
      roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#meet'),
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        JITSI_WATERMARK_LINK: 'https://www.omnimd.com/wp-content/uploads/2018/12/cropped-OmniMD_AI.png',
        SHOW_BRAND_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        BRAND_WATERMARK_LINK: 'https://www.omnimd.com',
        SHOW_POWERED_BY: false,
        SHOW_DEEP_LINKING_IMAGE: true,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: true,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'filmstrip',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'embedmeeting',
          'mute-everyone',
          'mute-video-everyone',
          'participants-pane',
          'security',
          'select-background',
          'shareaudio',
          'toggle-camera',
          'invite',
          'videoquality',
          'audioQuality']
      },
    };

    setTimeout(() => {
      if (!this.options) return;
      this.api = new JitsiMeetExternalAPI(this.domain, this.options);
      this.attachJitsiEventListeners();
    }, 1000);
  }

  attachJitsiEventListeners(): void {
    this.api.addEventListener('videoConferenceJoined', (videoConferenceJoinedObj: VideoConferenceEvent) => {
      const doctorName = this.sessionStorageService.getItem<string>('DoctorNameJitsi');
      if (this.api && doctorName) {
        this.api.executeCommand('displayName', doctorName);
      }
      this.createTeleVideoLog(videoConferenceJoinedObj, 'videoConferenceJoined');
      this.updateTelevideoStatus(this.dateTimeUtilityService.getCurrentDateTime(), '', 'isPatientJoin');
    });

    this.api.addEventListener('readyToClose', this.closeWindow.bind(this));

    this.api.addEventListener('cameraError', (cameraErrorObj) => {
      this.createTeleVideoLog(cameraErrorObj, 'cameraError');
    });

    this.api.addEventListener("videoConferenceLeft", (videoConferenceLeftObj: VideoConferenceEvent) => {
      this.createTeleVideoLog(videoConferenceLeftObj, 'videoConferenceLeft');
      this.updateTelevideoStatus('', this.dateTimeUtilityService.getCurrentDateTime(), 'patientCallEnd');
    });

    this.api.addEventListener("errorOccurred", (errorOccurredObj) => {
      this.createTeleVideoLog(errorOccurredObj, 'errorOccurred');
    });

    this.api.addEventListener("log", (logObj) => {
      this.createTeleVideoLog(logObj, 'log');
    });

    this.api.addEventListener("micError", (micErrorObj) => {
      this.createTeleVideoLog(micErrorObj, 'micError');
    });

    this.api.addEventListener("browserSupport", (browserSupportObj) => {
      this.createTeleVideoLog(browserSupportObj, 'browserSupport');
    });

    this.api.addEventListener("breakoutRoomsUpdated", (breakoutRoomsUpdatedObj) => {
      this.createTeleVideoLog(breakoutRoomsUpdatedObj, 'breakoutRoomsUpdated');
    });

    this.api.addEventListener("participantJoined", (participantJoinedObj: VideoConferenceEvent) => {
      this.createTeleVideoLog(participantJoinedObj, 'participantJoined');
      this.updateTelevideoStatus(this.dateTimeUtilityService.getCurrentDateTime(), '', 'callStart');
    });

    this.api.addEventListener("participantKickedOut", (participantKickedOutObj: VideoConferenceEvent) => {
      this.createTeleVideoLog(participantKickedOutObj, 'participantKickedOut');
    });

    this.api.addEventListener("participantLeft", (participantLeftObj: VideoConferenceEvent) => {
      this.createTeleVideoLog(participantLeftObj, 'participantLeft');
      const numberOfParticipants = this.api.getNumberOfParticipants();
      if (numberOfParticipants && numberOfParticipants < 2) {
        this.updateTelevideoStatus('', this.dateTimeUtilityService.getCurrentDateTime(), 'callEnd');
      }
    });

    this.api.addEventListener("conferenceCreatedTimestamp", (conferenceCreatedTimestampObj) => {
      this.createTeleVideoLog(conferenceCreatedTimestampObj, 'conferenceCreatedTimestamp');
    });

    this.api.addEventListener("videoQualityChanged", (videoQualityChangedObj) => {
      this.createTeleVideoLog(videoQualityChangedObj, 'videoQualityChanged');
    });

    this.api.addEventListener("peerConnectionFailure", (peerConnectionFailureObj) => {
      this.createTeleVideoLog(peerConnectionFailureObj, 'peerConnectionFailure');
    });

    this.api.addEventListener("suspendDetected", (suspendDetectedObj) => {
      this.createTeleVideoLog(suspendDetectedObj, 'suspendDetected');
    });

    this.api.addEventListener("moderationStatusChanged", (moderationStatusChangedObj) => {
      this.createTeleVideoLog(moderationStatusChangedObj, 'moderationStatusChanged');
    });

    this.api.addEventListener("moderationParticipantApproved", (moderationParticipantApprovedObj) => {
      this.createTeleVideoLog(moderationParticipantApprovedObj, 'moderationParticipantApproved');
    });

    this.api.addEventListener("moderationParticipantRejected", (moderationParticipantRejectedObj) => {
      this.createTeleVideoLog(moderationParticipantRejectedObj, 'moderationParticipantRejected');
    });

    this.api.addEventListener("audioAvailabilityChanged", () => {
      // Intentionally empty
    });

    this.api.addEventListener("audioMuteStatusChanged", (audioMuteStatusChangedObj) => {
      this.createTeleVideoLog(audioMuteStatusChangedObj, 'audioMuteStatusChanged');
    });

    this.api.addEventListener("videoAvailabilityChanged", () => {
      // Intentionally empty
    });

    this.api.addEventListener("videoMuteStatusChanged", (videoMuteStatusChangedObj) => {
      this.createTeleVideoLog(videoMuteStatusChangedObj, 'videoMuteStatusChanged');
    });
  }

  closeWindow(): void {
    this.updateTelevideoStatus('', this.dateTimeUtilityService.getCurrentDateTime(), 'patientCallEnd');
    this.close = true;
    setTimeout(() => {
      window.close();
    }, 1000);
  }

  onClose(): void {
    this.hideModal?.hide();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadMethod(event: BeforeUnloadEvent): void {
    if (!this.close) {
      event.preventDefault();
      this.updateTelevideoStatus('', this.dateTimeUtilityService.getCurrentDateTime(), 'patientCallEnd');

      // No need to set event.returnValue; event.preventDefault() is sufficient to show the confirmation dialog.
    }
  }


  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.api) {
      this.api.dispose();
      this.api = null;
    }

    setTimeout(() => {
      this.sessionStorageService.removeItem('DoctorNameJitsi');
      this.sessionStorageService.removeItem('RoomName');
      this.sessionStorageService.removeItem('appointmentIdJitsi');
      this.subscription$?.unsubscribe();

    }, 0);
    window.removeEventListener('beforeunload', this.beforeUnloadMethod.bind(this), true);
  }

  getTokenForAppointment(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.appointmentIdJitsi = this.sessionStorageService.getItem<string>('appointmentIdJitsi');

      if (!this.appointmentIdJitsi) {
        reject(new Error('Appointment ID not found'));
        return;
      }

      const params = new HttpParams()
        .append('appointmentId', this.appointmentIdJitsi)
        .append('participantType', 'patient');

      this.appointmentService.getJitsiTokenForDoctor<string>(params).subscribe({
        next: (data) => {
          this.jwtToken = data;
          this.updateTelevideoStatus(
            this.dateTimeUtilityService.getCurrentDateTime(),
            '',
            'isPatientJoin'
          );
          resolve(data);
        },
        error: (err) => {
          console.error('Failed to get Jitsi token:', err);
          reject(
            err instanceof Error
              ? err
              : new Error(`Failed to get Jitsi token: ${err?.message || JSON.stringify(err)}`)
          );
        },
      });
    });
  }


  updateTelevideoStatus(patientCallStart: string, patientCallEnd: string, from: string): void {

    this.appointmentIdJitsi = this.sessionStorageService.getItem<string>('appointmentIdJitsi');

    const json: TelevideoStatusPayload = {
      isPatientJoin: true,
      patientCallStart: patientCallStart,
      patientCallEnd: patientCallEnd,
      isDoctorJoin: false,
      doctorCallStart: "",
      doctorCallEnd: "",
      appointmentId: this.appointmentIdJitsi,
      doctorId: '',
      patientId: '',
      roomName: '',
      from: from
    }
    this.appointmentService.updateTelevideoStatus(json).subscribe({
      error: (error: Error) => {
        console.error('Failed to update televideo status:', error);
      }
    });
  }

  createTeleVideoLog(event: VideoConferenceEvent | ErrorEvent | Record<string, unknown>, category: string): void {
    const roomName = this.sessionStorageService.getItem<string>('RoomName');

    if (!roomName) {
      console.error('Room name not found for logging');
      return;
    }

    const json: TeleVideoLogPayload = {
      eventJson: JSON.stringify(event),
      roomName: roomName,
      category: category,
      source: 'DH_INDIA_PATIENT'
    };
    this.appointmentService.cretaeTeleVideoLogs(json).subscribe({
      error: (error) => {
        console.error('Failed to create televideo log:', error);
      }
    });
  }
}
