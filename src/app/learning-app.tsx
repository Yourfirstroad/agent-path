import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LearningProvider } from '@/features/learning/store'
import {
  Shell,
  Dashboard,
  Roadmap,
  LessonPage,
  Resources,
  Projects,
  Notes,
  Settings,
  NotFound,
} from '@/features/learning/pages'
const router = createBrowserRouter([
  {
    element: (
      <LearningProvider>
        <Shell />
      </LearningProvider>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'roadmap', element: <Roadmap /> },
      { path: 'learn/:id', element: <LessonPage /> },
      { path: 'resources', element: <Resources /> },
      { path: 'projects', element: <Projects /> },
      { path: 'notes', element: <Notes /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
export function App() {
  return <RouterProvider router={router} />
}
