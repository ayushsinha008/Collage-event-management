import { jest } from '@jest/globals';

export const initializeApp = jest.fn();
export const cert = jest.fn().mockReturnValue({});
export const getApps = jest.fn().mockReturnValue([]);
