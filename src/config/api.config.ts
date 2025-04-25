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
    PROFILE_UPDATE_ENDPOINT: "/api/auth/profile/update/"  // Added trailing slash
  },
  USERS: {
    BASE: "/api/users/",
    ME: "/api/auth/profile/",  // Updated to match Django's auth profile endpoint
    SAVED_ITEMS: "/api/users/saved-items/"
  },
  UNIVERSITIES: {
    BASE: "/api/universities/",
    FEATURED: "/api/universities/",
    PROGRAMS: "/api/programs/"
  },
  SEARCH: {
    GLOBAL: "/api/universities/search/global/"
  }
};