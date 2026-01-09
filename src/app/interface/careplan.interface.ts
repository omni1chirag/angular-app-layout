import { LabelValue } from "./common.interface";
import { VitalField } from "./vital-interface";

export interface CarePlanSetup extends CreateCarePlanSetup {
    carePlanSetupId: string;
}

export interface CreateCarePlanSetup {
    name: string;
    description: string | null;

    status: number;
    isMasterSetup: boolean;
    specializationId: number;

    doctorId: string | null;
    clinicId: string | null;

    escalationTrigger: EscalationTrigger | null;

    diagnosis: string[];
    goals: string[];
    monitoringTasks: MonitoringTask[];

    escalationRecipient: EscalationRecipient;
    communicationMode: CommunicationMode;
}

export type EscalationTrigger = 'ABOVE' | 'BELOW' | 'BOTH';
export type MonitoringTaskType = 'VITAL' | 'TASK';

export interface MonitoringTask {
    monitoringTaskId: string;
    taskType: MonitoringTaskType;
    name: string;
    lowerThreshold: number;
    upperThreshold: number;
}

export interface EscalationRecipient {
    notifyCareTeam: boolean;
    notifyDoctor: boolean;
    notifyAmbulance: boolean;
    notifyFamilyMember: boolean;
}

export interface CommunicationMode {
    notifyCareTeam: boolean;
    notifyDoctor: boolean;
    notifyAmbulance: boolean;
    notifyFamilyMember: boolean;
}

export interface CarePlanAssignRequest {
    mappings: {
        clinicId: string;
        doctorId: string;
    }[];

}

export interface CarePlanSetupList {
    carePlanSetupId: string;
    name: string;
    status: number;
    diagnosis: string;
    goals: string;
    doctorName: string;
    clinicName: string;
    doctorId: string;
    clinicId: string;
    specializationId: number;
    specializationName: string;
}


export interface CarePlanSoftSearch {
    carePlanSetupId: string | null;
    name: string | null;
    specializationId: number | null;
    specializationName: string | null;
    diagnosis: string | null;
    goals: string | null;
    custum: boolean;
}





export interface CarePlan {
    description: string | null; // oprional
    carePlanId: string | null;
    patientId: string | null;
    name: string | null;
    notes: string | null;
    startDate: Date | null;
    endDate: Date | null;
    appointmentId: string | null;
    assignedBy: string | null;
    escalationTrigger: EscalationTrigger | null

    diagnosis: string[];
    goals: string[];
    monitoringTasks: MonitoringTask[];
    careTeamMemberDetails: LabelValue<string>[];

    escalationRecipient: EscalationRecipient | null;
    communicationMode: CommunicationMode | null;

    status: number | null;
}

export interface CarePlanVitalList {
    name: string;
    recordedDate: Date;
    notes: string;
    reading: VitalField;
}


export interface CarePlanTaskLogList {
    carePlanTaskLogId: string;
    name: string;
    recordedDate: Date;
    taskDone: boolean;
    notes: string;
}

export interface CreateCarePlanTaskLogList {
    name: string;
    recordedDate: Date;
    taskDone: boolean;
    notes: string;
}


export interface PatientCarePlanDetail {
    patientId: string | null;
    title: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    carePlanId: string | null;
    name: string | null;
    notes: Date | null;
    startDate: Date | null;
    endDate: string | null;
    status: number | null;
    diagnosis: string[];
    goals: string[];
    monitoringTasks: MonitoringTask[];
}

export interface PatientCarePlanList {
    carePlanId: string | null;
    name: string | null;

    patientId: string | null;
    firstName: string | null;
    lastName: string | null;

    status: number | null;

    diagnosis: string | null;

    startDate: Date | null;          // ISO date-time
    endDate: Date | null;            // ISO date-time

    appointmentSignOff: number | null;

    isEditable: boolean | null;

    assignedById: string | null;
    assignedBy: string | null;
}

export interface CreateCarePlan {
    name: string;
    notes: string | null;

    startDate: Date;
    endDate: Date;

    appointmentId: string | null;

    assignedBy: string;

    escalationTrigger: EscalationTrigger | null;

    status: number | null;

    diagnosis: string[];
    goals: string[];

    monitoringTasks: MonitoringTask[];

    careTeamMembers: string[];

    escalationRecipient: EscalationRecipient;

    communicationMode: CommunicationMode;
}
