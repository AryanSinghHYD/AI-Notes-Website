import Cookies from 'js-cookie';
import { AppState } from '../types';

const STORAGE_KEY = 'notes_app_state';

export const saveState = (state: AppState) => {
  try {
    const stateString = JSON.stringify(state);
    // Set a longer expiry and increase size limit
    Cookies.set(STORAGE_KEY, stateString, { 
      expires: 365,
      sameSite: 'strict',
      secure: true
    });
    // Backup to localStorage in case cookie size limit is exceeded
    localStorage.setItem(STORAGE_KEY, stateString);
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

export const loadState = (): AppState => {
  try {
    // Try cookies first
    const savedState = Cookies.get(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
    // Fall back to localStorage
    const localState = localStorage.getItem(STORAGE_KEY);
    if (localState) {
      return JSON.parse(localState);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return { notes: [], apiKey: null };
};