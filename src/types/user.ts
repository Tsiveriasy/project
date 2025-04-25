export interface TestResult {
  date: string
  recommended_fields: string[]
  recommended_programs: {
    id: number
    name: string
    university_name: string
    match_percentage: number
  }[]
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  bio: string
  interests: string[]
  savedUniversities: number[]
  savedPrograms: number[]
  educationLevel: string
  currentUniversity: string
  role: string
  academicRecords: {
    year: string
    semester: string
    gpa: number
    courses: {
      name: string
      grade: string
      credits: number
    }[]
  }[]
  testResults: TestResult | null
}
