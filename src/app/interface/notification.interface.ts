export interface NotificationResponse {
    notificationId: string | null;
    senderId: string | null;
    receiverId: string | null;
    message: string | null;
    role: string | null;
    read: boolean;
    createdAt: Date | null;
}


export interface LabelIcon {
    label: string;
    icon: string;
}