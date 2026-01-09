export interface Lab {
    selectedLabId: string;
    patientName: string
    patientId: string | null;
    testType: string;
    testName: string;
    orderDate: Date;
    testDate: Date;
    sampleCollectionLocation: string;
    status: number;
}

