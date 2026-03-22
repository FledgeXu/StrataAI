export interface CurrentUser {
  id: number
  email: string
  displayName: string
  role: string
  status: string
}

export interface AuthSession {
  accessToken: string
  currentUser: CurrentUser
}

export interface AuthCredentials {
  email: string
  password: string
}
