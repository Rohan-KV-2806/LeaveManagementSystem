import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import Login from './components/core/login'
import Dashboard from './components/core/dashboard'
import ApprovalsTable from './components/manager/ApprovalsTable'

const rootRoute = createRootRoute()

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
})

export const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/approvals',
  component: ApprovalsTable,
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/' })
    }
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Login,
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (token) {
      throw redirect({ to: '/dashboard' })
    }
  }
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  approvalsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}