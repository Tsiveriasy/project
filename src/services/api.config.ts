export const API_BASE_URL = 'http://localhost:8000/api'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  RETRY: {
    retries: 3,
    retryDelay: 1000
  },
  AUTH: {
    LOGIN_ENDPOINT: `${API_BASE_URL}/auth/login/`,
    REGISTER_ENDPOINT: `${API_BASE_URL}/auth/register/`,
    PROFILE_ENDPOINT: `${API_BASE_URL}/user/profile/`,
    PROFILE_UPDATE_ENDPOINT: `${API_BASE_URL}/user/profile/update/`,
    ACADEMIC_RECORDS_UPDATE_ENDPOINT: `${API_BASE_URL}/user/academic-records/update/`
  },
  USERS: {
    BASE: `${API_BASE_URL}/users/`,
    ME: `${API_BASE_URL}/users/me/`,
    SAVED_ITEMS: `${API_BASE_URL}/users/me/saved-items/`,
    SAVED_PROGRAMS: `${API_BASE_URL}/users/me/saved-programs/`,
    SAVED_UNIVERSITIES: `${API_BASE_URL}/users/me/saved-universities/`
  },
  UNIVERSITIES: {
    LIST: `${API_BASE_URL}/universities/`,
    DETAIL: (id: number) => `${API_BASE_URL}/universities/${id}/`,
    PROGRAMS: (id: number) => `${API_BASE_URL}/universities/${id}/programs/`
  },
  PROGRAMS: {
    LIST: `${API_BASE_URL}/programs/`,
    DETAIL: (id: number) => `${API_BASE_URL}/programs/${id}/`,
    SEARCH: `${API_BASE_URL}/programs/search/`
  },
  SEARCH: {
    UNIVERSITIES: `${API_BASE_URL}/search/universities/`,
    PROGRAMS: `${API_BASE_URL}/search/programs/`
  }
}
