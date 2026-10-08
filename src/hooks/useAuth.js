import { useAuthContext } from '../context/AuthContext';

// Custom hook: single access point for authentication state and actions.
export function useAuth() {
  return useAuthContext();
}
