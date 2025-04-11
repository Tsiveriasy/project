export const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  TIMEOUT: 15000,
  HEADERS: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  RETRY: {
    retries: 3,
    retryDelay: 1000,
  },
  AUTH: {
    LOGIN_ENDPOINT: "/api/auth/login/",
    REGISTER_ENDPOINT: "/api/auth/register/",
    PROFILE_ENDPOINT: "/api/auth/profile/",
    PROFILE_UPDATE_ENDPOINT: "/api/auth/profile/update/"
  },
  UNIVERSITIES: {
    BASE: "/api/universities/",
    FEATURED: "/api/universities/",  // Changed to use base endpoint since featured doesn't exist
    PROGRAMS: "/api/programs/"
  }
};