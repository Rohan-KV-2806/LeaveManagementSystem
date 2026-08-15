import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { Toaster } from 'sonner' // <-- Import this

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors /> {/* <-- Add this */}
    </>
  )
}

export default App