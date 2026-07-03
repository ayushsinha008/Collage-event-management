export const getAuth = () => ({
  verifyIdToken: async (token: string) => {
    if (token === 'invalid_token') {
      throw new Error('Invalid token');
    }
    if (token === 'admin_mock_token' || token === 'mock-organizer-token') {
      return { uid: 'mock-admin', email: 'admin@example.com', name: 'Admin User' };
    }
    if (token === 'staff-organizer-token') {
      return { uid: 'festflow-organizer', email: 'organizer@festflow.internal', name: 'FestFlow Organizer' };
    }
    if (token === 'staff-volunteer-token') {
      return { uid: 'festflow-volunteer', email: 'volunteer@festflow.internal', name: 'FestFlow Volunteer' };
    }
    return { uid: 'mock-1', email: 'test@example.com', name: 'Mock Student' };
  },
  createCustomToken: async (uid: string) => {
    if (uid === 'festflow-organizer') return 'staff-organizer-token';
    if (uid === 'festflow-volunteer') return 'staff-volunteer-token';
    return `custom-${uid}`;
  },
});
