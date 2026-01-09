export interface ExternalScript {
  id: string;
  src: string;
}
export class ExternalJS {
  static readonly JsUrls: ExternalScript[] = [
    {
      id: 'jitsi',
      src: 'assets/js/jitsi/external_api.js'
    },
    {
      id: 'jitsimin',
      src: 'assets/js/jitsi/lib-jitsi-meet.min.js'
    }
  ];
}