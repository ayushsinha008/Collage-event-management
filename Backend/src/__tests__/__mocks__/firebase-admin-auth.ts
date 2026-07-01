export const getAuth = () => ({
  verifyIdToken: async (token: string) => {
    return { uid: 'mock', email: 'mock@example.com' };
  }
});
