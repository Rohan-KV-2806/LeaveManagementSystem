import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import Login from './components/core/login'
import Dashboard from './components/core/dashboard'

const rootRoute = createRootRoute()

// Protected Route Logic
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: () => {
    // Check for JWT token
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({
        to: '/',
      })
    }
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Login,
  // If already logged in, redirect to dashboard
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (token) {
      throw redirect({
        to: '/dashboard',
      })
    }
  }
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}