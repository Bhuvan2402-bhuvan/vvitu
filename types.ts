
export enum UserRole {
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  rollNo?: string;
  branch?: string;
  yearSec?: string;
  phone?: string;
  password: string;
  approved: boolean;
}

export type RegistrationStatus = 'pending' | 'confirmed';

export interface Registration {
  volunteerId: string;
  status: RegistrationStatus;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  registrations: Registration[];
}

export interface EventPhoto {
  id:string;
  imageUrl: string;
  description: string;
  eventName: string;
  date: string;
}

export type AttendanceRecord = {
  [volunteerId: string]: 'present' | 'absent';
};

export type Attendance = {
  [eventId: string]: AttendanceRecord;
};

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}
