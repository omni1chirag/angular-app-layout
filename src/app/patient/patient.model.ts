
export class Patient {
    patientId?: string = Date.now().toString();
    title?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    age: number;
    gender: string;
    genderFreeText?: string;
    maritalStatus?: string;
    maritalStatusFreeText?: string;
    aadhaarNumber: string;
    abhaId?: string;
    preferredLanguage?: string;

    mobileNumber: string;
    alternateContactNumber?: string;
    emailAddress: string;
    address1: string;
    address2?: string;
    pincode: string;
    city: string;
    state: string;
    country: string;

    emergencyContactName: string;
    emergencyContactNumber: string;
    relationshipToPatient: string;

    bloodGroup?: string;
    knownAllergies?: string[];
    chronicConditions?: string[];
    noKnownChronicConditions?: boolean;
    currentMedications?: string[];

    insuranceProvider?: string;
    insuranceIdNumber?: string;
    policyExpiryDate?: Date;

    constructor(data: Partial<Patient>) {
        this.patientId = data.patientId ?? Date.now().toString();
        this.title = data.title;
        this.firstName = data.firstName ?? '';
        this.middleName = data.middleName;
        this.lastName = data.lastName ?? '';
        this.dateOfBirth = data.dateOfBirth ?? new Date();
        this.age = this.calculateAge(this.dateOfBirth);
        this.gender = data.gender ?? '';
        this.genderFreeText = data.genderFreeText ?? '';
        this.maritalStatus = data.maritalStatus;
        this.maritalStatusFreeText = data.maritalStatusFreeText;
        this.aadhaarNumber = data.aadhaarNumber ?? '';
        this.abhaId = data.abhaId;
        this.preferredLanguage = data.preferredLanguage;

        this.mobileNumber = data.mobileNumber ?? '';
        this.alternateContactNumber = data.alternateContactNumber;
        this.emailAddress = data.emailAddress ?? '';
        this.address1 = data.address1 ?? '';
        this.address2 = data.address2;
        this.pincode = data.pincode ?? '';
        this.city = data.city ?? '';
        this.state = data.state ?? '';
        this.country = data.country ?? '';

        this.emergencyContactName = data.emergencyContactName ?? '';
        this.emergencyContactNumber = data.emergencyContactNumber ?? '';
        this.relationshipToPatient = data.relationshipToPatient ?? '';

        this.bloodGroup = data.bloodGroup;
        this.knownAllergies = data.knownAllergies ?? [];
        this.chronicConditions = data.chronicConditions ?? [];
        this.noKnownChronicConditions = data.noKnownChronicConditions;
        this.currentMedications = data.currentMedications ?? [];

        this.insuranceProvider = data.insuranceProvider;
        this.insuranceIdNumber = data.insuranceIdNumber;
        this.policyExpiryDate = data.policyExpiryDate;
    }

    private calculateAge(dob: Date): number {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }
}
