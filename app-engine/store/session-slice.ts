import type { StoreSlice } from '../index'
import { FetchError, fetchJson } from '../library/fetch';
import { AuthErrorResponse, AuthResponse } from '../../app-server/jwt-auth'
import { AuthMethod } from '../types/app-engine'
import { app_logger } from '../library/logger'

export interface SessionState {
  create_session_error: string
  token: string
}

export interface CreateSessionProps {
  address: string
  signed_message: string
  network: string
  message: string
  auth_method: AuthMethod
}

export interface SessionActions {
  createSession: (input: CreateSessionProps) => Promise<void>
  destroySession: () => Promise<void>
}

export type SessionSlice = SessionState & SessionActions

const defaultSessionState = {
  create_session_error: '',
  token: ''
}

export const createSessionSlice: StoreSlice<SessionSlice> = (set, get) => ({
  ...defaultSessionState,
  createSession: async ({
    network,
    address,
    message,
    signed_message,
    auth_method,
  }: CreateSessionProps) => {
    app_logger.log('🍪 create cookie session', JSON.stringify({ address, signed_message }))
    const login_payload: CreateSessionProps = {
      network,
      address,
      message,
      signed_message,
      auth_method,
    }

    try {
      const { token, error } = await fetchJson<AuthResponse>('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login_payload),
      })
      app_logger.log('🍪 cookie session created!')

      // We already know the error, we pass it to the app to know it.
      if (error || !token) throw error

      set({ token, create_session_error: '' })
    } catch (error: AuthErrorResponse) {
      console.error('An unexpected error happened while trying create session:', error)

      set({ create_session_error: error.message, token: '' }
    }
  },

  destroySession: async () => {
    // TODO: WIP please complete it
    app_logger.log('🍪 destroy cookie session')
    try {
      await fetchJson('/api/logout', {
        method: 'POST',
      })
      app_logger.log('🍪 cookie session destroyed!')

      const user = get().user

      if (!user) return
      if (user.auth_method === 'web3_auth') get().web3authLogout()
      
      get().setUser(null)
    } catch (error) {
      console.error('An unexpected error happened:', error)
    }
  },
})
