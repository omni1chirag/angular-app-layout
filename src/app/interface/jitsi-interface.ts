// Type definitions for Jitsi Meet External API
export type JitsiMeetExternalAPIConstructor = new (domain: string, options: JitsiOptions) => JitsiMeetAPI;

export interface JitsiOptions {
  jwt?: string;
  roomName: string;
  width: string;
  height: string;
  parentNode: Element | null;
  interfaceConfigOverwrite?: InterfaceConfig;
}

export interface InterfaceConfig {
  SHOW_JITSI_WATERMARK?: boolean;
  JITSI_WATERMARK_LINK?: string;
  SHOW_BRAND_WATERMARK?: boolean;
  SHOW_WATERMARK_FOR_GUESTS?: boolean;
  BRAND_WATERMARK_LINK?: string;
  SHOW_POWERED_BY?: boolean;
  SHOW_DEEP_LINKING_IMAGE?: boolean;
  GENERATE_ROOMNAMES_ON_WELCOME_PAGE?: boolean;
  DISPLAY_WELCOME_PAGE_CONTENT?: boolean;
  DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT?: boolean;
  TOOLBAR_BUTTONS?: string[];
}

export interface JitsiMeetAPI {
  addEventListener(event: string, listener: (data?: unknown) => void): void;
  executeCommand(command: string, ...args: unknown[]): void;
  getNumberOfParticipants(): number;
  dispose(): void;
}

export interface VideoConferenceEvent {
  roomName?: string;
  id?: string;
  displayName?: string;
}

export interface TeleVideoLogPayload {
  eventJson: string;
  roomName: string;
  category: string;
  source: string;
}

export interface TelevideoStatusPayload {
  isPatientJoin: boolean;
  patientCallStart: string;
  patientCallEnd: string;
  isDoctorJoin: boolean;
  doctorCallStart: string;
  doctorCallEnd: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  roomName: string;
  from: string;
}
