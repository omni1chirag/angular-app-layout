export interface Immunization {
    immunizationId: string | null;
    patientId: string | null;
    immunizationName: string;
    appointmentId: string | null;
    doseNumber: string;
    dateOfVaccination: Date | null;
    administeredBy: string;
    routeId: string | null;
    siteId: string | null;
    status: number | null;
    comments: string | null;
}

export interface ImmunizationList extends Immunization {
    firstName: string | null;
    lastName: string | null;
    lastUpdatedBy: string | null;
    isEditable: boolean | null;
    appointmentSignOff: number | null;

}