export class Appointment {
    appointmentId: string;
    patientName: string;
    appointmentType: string;
    providerName: string;
    practice: string;
    appointmentDate?: Date;
    startTime?: Date;
    endTime?: Date;
    duration: number;
    reasonForVisit: string;
    notes?: string;
    status?: string;
    paymentStatus?: string;
    constructor(appointment: any) {
        const { appointmentId, patientName, appointmentType, providerName, startTime, endTime,
            practice, appointmentDate, duration, reasonForVisit, notes, status, paymentStatus } = appointment;
        this.appointmentId = appointmentId ?? Date.now().toString();
        this.patientName = patientName;
        this.appointmentType = appointmentType ?? 'In-person';
        this.providerName = providerName;
        this.practice = practice;
        this.appointmentDate = appointmentDate ? new Date(appointmentDate) : undefined; 
        this.duration = duration ?? 0;
        this.reasonForVisit = reasonForVisit;
        this.notes = notes;
        this.status = status ?? 'Scheduled';
        this.paymentStatus = paymentStatus ?? 'Pending';
        this.startTime = startTime ? new Date(startTime) : undefined;
        this.endTime = endTime ? new Date(endTime) : undefined;
    }
}

export const providerList: any[] = [
    { "name": "John Doe", "code": "John Doe" },
    { "name": "Jane Smith", "code": "Jane Smith" },
    { "name": "Robert Johnson", "code": "Robert Johnson" },
    { "name": "Emily Davis", "code": "Emily Davis" },
    { "name": "Michael Wilson", "code": "Michael Wilson" },
    { "name": "Sarah Brown", "code": "Sarah Brown" },
    { "name": "David Martinez", "code": "David Martinez" },
    { "name": "Laura Taylor", "code": "Laura Taylor" },
    { "name": "James Anderson", "code": "James Anderson" },
    { "name": "Sophia Thomas", "code": "Sophia Thomas" }
]
export const practiceList = [
    { "name": "Sunrise Medical Center", "code": "Sunrise Medical Center" },
    { "name": "Evergreen Family Clinic", "code": "Evergreen Family Clinic" },
    { "name": "Harmony Health Group", "code": "Harmony Health Group" },
    { "name": "Wellness Care Associates", "code": "Wellness Care Associates" },
    { "name": "Lifeline Hospital", "code": "Lifeline Hospital" },
    { "name": "New Horizons Health", "code": "New Horizons Health" },
    { "name": "MetroCare Clinic", "code": "MetroCare Clinic" },
    { "name": "Oakwood Medical Practice", "code": "Oakwood Medical Practice" },
    { "name": "Pinehill Health Solutions", "code": "Pinehill Health Solutions" },
    { "name": "BlueRiver Specialty Care", "code": "BlueRiver Specialty Care" }
]


export const appointmentTypeOption = [
    { name: 'In-person', code: 'In-person' },
    { name: 'Virtual', code: 'Virtual' },
]

export const reasonForVisits = [
    { "name": "General Consultation", "code": "General Consultation" },
    { "name": "Follow-up Visit", "code": "Follow-up Visit" },
    { "name": "Annual Health Checkup", "code": "Annual Health Checkup" },
    { "name": "Flu or Cold Symptoms", "code": "Flu or Cold Symptoms" },
    { "name": "Chronic Disease Management", "code": "Chronic Disease Management" },
    { "name": "Vaccination", "code": "Vaccination" },
    { "name": "Allergy Consultation", "code": "Allergy Consultation" },
    { "name": "Pain Management", "code": "Pain Management" },
    { "name": "Skin Issues", "code": "Skin Issues" },
    { "name": "Mental Health Consultation", "code": "Mental Health Consultation" }
]
export const statusOption = [
    { "name": "Scheduled", "code": "Scheduled" },
    { "name": "Completed", "code": "Completed" },
    { "name": "Cancelled", "code": "Cancelled" }
];
export const paymentstatusOption = [
    { "name": "Pending", "code": "Pending" },
    { "name": "Paid", "code": "Paid" },
    { "name": "Failed", "code": "Failed" }
];
export const externalAppointments: Array<Appointment> =
  [
    {
      "appointmentId": "1743413191747",
      "patientName": "doe-0",
      "appointmentType": "In-person",
      "providerName": "John Doe",
      "practice": "Sunrise Medical Center",
      "duration": 15,
      "reasonForVisit": "Annual Health Checkup",
      "notes": "Test",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-02-28T18:30:00.000Z"),
      "startTime": new Date("2025-03-31T11:26:16.645Z"),
      "endTime": new Date("2025-03-31T11:41:16.645Z"),
    },
    {
      "appointmentId": "1743413191748",
      "patientName": "doe-1",
      "appointmentType": "Virtual",
      "providerName": "Jane Smith",
      "practice": "Evergreen Family Clinic",
      "duration": 20,
      "reasonForVisit": "General Consultation",
      "notes": "Follow-up required",
      "status": "Completed",
      "paymentStatus": "Paid",
      "appointmentDate": new Date("2025-03-01T10:00:00.000Z"),
      "startTime": new Date("2025-03-31T12:00:00.645Z"),
      "endTime": new Date("2025-03-31T12:20:00.645Z"),
    },
    {
      "appointmentId": "1743413191749",
      "patientName": "doe-2",
      "appointmentType": "In-person",
      "providerName": "Robert Johnson",
      "practice": "Harmony Health Group",
      "duration": 30,
      "reasonForVisit": "Follow-up Visit",
      "notes": "Review medication",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-03-02T14:00:00.000Z"),
      "startTime": new Date("2025-03-31T14:30:00.645Z"),
      "endTime": new Date("2025-03-31T15:00:00.645Z"),
    },
    {
      "appointmentId": "1743413191750",
      "patientName": "doe-3",
      "appointmentType": "Virtual",
      "providerName": "Emily Davis",
      "practice": "Wellness Care Associates",
      "duration": 15,
      "reasonForVisit": "Flu or Cold Symptoms",
      "notes": "Fever for 3 days",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-03-03T08:00:00.000Z"),
      "startTime": new Date("2025-03-31T09:00:00.645Z"),
      "endTime": new Date("2025-03-31T09:15:00.645Z"),
    },
    {
      "appointmentId": "1743413191751",
      "patientName": "doe-4",
      "appointmentType": "In-person",
      "providerName": "Michael Wilson",
      "practice": "Lifeline Hospital",
      "duration": 45,
      "reasonForVisit": "Chronic Disease Management",
      "notes": "Diabetes checkup",
      "status": "Rescheduled",
      "paymentStatus": "Paid",
      "appointmentDate": new Date("2025-03-04T16:00:00.000Z"),
      "startTime": new Date("2025-03-31T17:00:00.645Z"),
      "endTime": new Date("2025-03-31T17:45:00.645Z"),
    },
    {
      "appointmentId": "1743413191752",
      "patientName": "doe-5",
      "appointmentType": "Virtual",
      "providerName": "Sarah Brown",
      "practice": "New Horizons Health",
      "duration": 20,
      "reasonForVisit": "Vaccination",
      "notes": "COVID booster shot",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-03-05T11:00:00.000Z"),
      "startTime": new Date("2025-03-31T12:30:00.645Z"),
      "endTime": new Date("2025-03-31T12:50:00.645Z"),
    },

    {
      "appointmentId": "1743413191753",
      "patientName": "doe-6",
      "appointmentType": "In-person",
      "providerName": "David MartineZ",
      "practice": "MetroCare Clinic",
      "duration": 25,
      "reasonForVisit": "Allergy Consultation",
      "notes": "Severe pollen allergy",
      "status": "Scheduled",
      "paymentStatus": "Paid",
      "appointmentDate": new Date("2025-03-06T15:00:00.000Z"),
      "startTime": new Date("2025-03-31T16:00:00.645Z"),
      "endTime": new Date("2025-03-31T16:25:00.645Z")
    },
    {
      "appointmentId": "1743413191754",
      "patientName": "doe-7",
      "appointmentType": "Virtual",
      "providerName": "Laura Taylor",
      "practice": "Oakwood Medical Practice",
      "duration": 10,
      "reasonForVisit": "Pain Management",
      "notes": "Lower back pain",
      "status": "Completed",
      "paymentStatus": "Paid",
      "appointmentDate": new Date("2025-03-07T09:00:00.000Z"),
      "startTime": new Date("2025-03-31T10:30:00.645Z"),
      "endTime": new Date("2025-03-31T10:40:00.645Z"),
    },
    {
      "appointmentId": "1743413191755",
      "patientName": "doe-8",
      "appointmentType": "In-person",
      "providerName": "James Anderson",
      "practice": "Pinehill Health Solutions",
      "duration": 30,
      "reasonForVisit": "Skin Issues",
      "notes": "Rashes on arms",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-03-08T13:00:00.000Z"),
      "startTime": new Date("2025-03-31T14:00:00.645Z"),
      "endTime": new Date("2025-03-31T14:30:00.645Z"),
    },
    {
      "appointmentId": "1743413191756",
      "patientName": "doe-9",
      "appointmentType": "Virtual",
      "providerName": "Sophia Thomas",
      "practice": "BlueRiver Specialty Care",
      "duration": 40,
      "reasonForVisit": "Mental Health Consultation",
      "notes": "Anxiety issues",
      "status": "Scheduled",
      "paymentStatus": "Pending",
      "appointmentDate": new Date("2025-03-09T17:00:00.000Z"),
      "startTime": new Date("2025-03-31T18:00:00.645Z"),
      "endTime": new Date("2025-03-31T18:40:00.645Z"),
    }
  ]
