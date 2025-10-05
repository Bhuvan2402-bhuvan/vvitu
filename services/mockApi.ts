import { User, UserRole, Event, EventPhoto, Attendance, ChatMessage } from '../types';

const init = () => {
  if (!localStorage.getItem('users')) {
    const adminUser: User = {
      id: 'admin',
      role: UserRole.ADMIN,
      name: 'Admin User',
      password: 'admin',
      approved: true,
    };
    localStorage.setItem('users', JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem('events')) {
    localStorage.setItem('events', JSON.stringify([]));
  }
  if (!localStorage.getItem('eventPhotos')) {
    localStorage.setItem('eventPhotos', JSON.stringify([]));
  }
  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify({}));
  }
  if (!localStorage.getItem('chatMessages')) {
    localStorage.setItem('chatMessages', JSON.stringify([]));
  }
};

init();

const api = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem('users') || '[]'),
  getEvents: (): Event[] => JSON.parse(localStorage.getItem('events') || '[]'),
  getEventPhotos: (): EventPhoto[] => JSON.parse(localStorage.getItem('eventPhotos') || '[]'),
  getAttendance: (): Attendance => JSON.parse(localStorage.getItem('attendance') || '{}'),
  getChatMessages: (): ChatMessage[] => JSON.parse(localStorage.getItem('chatMessages') || '[]'),
  
  saveUsers: (users: User[]) => localStorage.setItem('users', JSON.stringify(users)),
  saveEvents: (events: Event[]) => localStorage.setItem('events', JSON.stringify(events)),
  saveEventPhotos: (photos: EventPhoto[]) => localStorage.setItem('eventPhotos', JSON.stringify(photos)),
  saveAttendance: (attendance: Attendance) => localStorage.setItem('attendance', JSON.stringify(attendance)),
  saveChatMessages: (messages: ChatMessage[]) => localStorage.setItem('chatMessages', JSON.stringify(messages)),

  login: (identifier: string, password: string):User | null => {
    const users = api.getUsers();
    const identifierLower = identifier.toLowerCase();
    
    const user = users.find(u => {
        if (u.password !== password) return false;

        if (u.role === UserRole.ADMIN) {
            return u.name.toLowerCase() === identifierLower;
        }
        if (u.role === UserRole.VOLUNTEER) {
            return u.rollNo?.toLowerCase() === identifierLower;
        }
        return false;
    });

    return user || null;
  },

  signup: (userData: Omit<User, 'id' | 'role' | 'approved'>): User | null => {
    const users = api.getUsers();
    if (users.some(u => u.name.toLowerCase() === userData.name.toLowerCase() || u.rollNo === userData.rollNo)) {
      return null;
    }
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      role: UserRole.VOLUNTEER,
      approved: false,
    };
    users.push(newUser);
    api.saveUsers(users);
    return newUser;
  },
  
  approveUser: (userId: string): boolean => {
      const users = api.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return false;
      users[userIndex].approved = true;
      api.saveUsers(users);
      return true;
  },

  createEvent: (eventData: Omit<Event, 'id' | 'registrations'>): Event => {
    const events = api.getEvents();
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      registrations: [],
    };
    events.push(newEvent);
    api.saveEvents(events);
    return newEvent;
  },

  updateEvent: (eventId: string, eventData: Omit<Event, 'id' | 'registrations'>): Event | null => {
    const events = api.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    events[eventIndex] = {
        ...events[eventIndex],
        name: eventData.name,
        date: eventData.date,
        description: eventData.description,
    };
    
    api.saveEvents(events);
    return events[eventIndex];
  },

  deleteEvent: (eventId: string): boolean => {
    let events = api.getEvents();
    const initialLength = events.length;
    events = events.filter(e => e.id !== eventId);
    if (events.length === initialLength) return false;
    api.saveEvents(events);

    const attendance = api.getAttendance();
    if (attendance[eventId]) {
        delete attendance[eventId];
        api.saveAttendance(attendance);
    }
    return true;
  },

  registerForEvent: (eventId: string, volunteerId: string): boolean => {
    const events = api.getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    const alreadyRegistered = events[eventIndex].registrations.some(r => r.volunteerId === volunteerId);
    if (!alreadyRegistered) {
        events[eventIndex].registrations.push({ volunteerId, status: 'pending' });
        api.saveEvents(events);
        return true;
    }
    return false;
  },

  confirmRegistration: (eventId: string, volunteerId: string): boolean => {
      const events = api.getEvents();
      const eventIndex = events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) return false;
      
      const regIndex = events[eventIndex].registrations.findIndex(r => r.volunteerId === volunteerId);
      if (regIndex === -1) return false;

      events[eventIndex].registrations[regIndex].status = 'confirmed';
      api.saveEvents(events);
      return true;
  },

  postAttendance: (eventId: string, attendanceData: { [volunteerId: string]: 'present' | 'absent' }) => {
    const attendance = api.getAttendance();
    if (!attendance[eventId]) {
      attendance[eventId] = {};
    }
    attendance[eventId] = { ...attendance[eventId], ...attendanceData };
    api.saveAttendance(attendance);
  },

  deleteAttendance: (eventId: string): boolean => {
    const attendance = api.getAttendance();
    if (!attendance[eventId]) return false;
    
    delete attendance[eventId];
    api.saveAttendance(attendance);
    return true;
  },

  addEventPhoto: (photoData: Omit<EventPhoto, 'id'>): EventPhoto => {
    const photos = api.getEventPhotos();
    const newPhoto: EventPhoto = {
      ...photoData,
      id: `photo_${Date.now()}`,
    };
    photos.push(newPhoto);
    api.saveEventPhotos(photos);
    return newPhoto;
  },
  
  updateEventPhoto: (photoId: string, photoData: { description: string; eventName: string }): EventPhoto | null => {
    const photos = api.getEventPhotos();
    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return null;

    photos[photoIndex] = {
        ...photos[photoIndex],
        description: photoData.description,
        eventName: photoData.eventName,
    };
    
    api.saveEventPhotos(photos);
    return photos[photoIndex];
  },

  deleteEventPhoto: (photoId: string): boolean => {
      let photos = api.getEventPhotos();
      const initialLength = photos.length;
      photos = photos.filter(p => p.id !== photoId);
      if(photos.length === initialLength) return false;

      api.saveEventPhotos(photos);
      return true;
  },

  postChatMessage: (messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
      const messages = api.getChatMessages();
      const newMessage: ChatMessage = {
          ...messageData,
          id: `msg_${Date.now()}`,
          timestamp: Date.now(),
      };
      messages.push(newMessage);
      api.saveChatMessages(messages);
      return newMessage;
  }
};

export default api;