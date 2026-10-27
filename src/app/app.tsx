import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences'
import { ProjectsProvider } from '@/features/projects/use-projects'
import { MarketingLayout, WorkspaceLayout } from '@/layouts/layouts'
import { LoadingState } from '@/components/shared'
import { ErrorBoundary } from './error-boundary'

const Landing = lazy(() => import('@/pages/landing'))
const Portfolio = lazy(() => import('@/pages/portfolio'))
const Guide = lazy(() => import('@/pages/guide'))
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Projects = lazy(() => import('@/features/projects/pages/list'))
const ProjectForm = lazy(() => import('@/features/projects/pages/form'))
const ProjectDetail = lazy(() => import('@/features/projects/pages/detail'))
const Gallery = lazy(() => import('@/pages/gallery'))
const Settings = lazy(() => import('@/pages/settings'))

function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${pathname.startsWith('/workspace') ? '工作空间' : '你的前端起点'} · Foundry`
  }, [pathname])
  return null
}
function Toasts() {
  const { preferences } = usePreferences()
  return <Toaster theme={preferences.theme} richColors position="bottom-right" closeButton />
}
function NotFound() {
  return (
    <div className="empty-state">
      <span className="display-number">404</span>
      <h1>这个页面还不存在</h1>
      <p>换一个入口，继续你的探索。</p>
      <Link to="/" className="text-link">
        返回首页 →
      </Link>
    </div>
  )
}
export function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <BrowserRouter>
          <RouteEffects />
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route index element={<Landing />} />
                <Route path="showcase" element={<Portfolio />} />
                <Route path="guide" element={<Guide />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                path="workspace"
                element={
                  <ProjectsProvider>
                    <WorkspaceLayout />
                  </ProjectsProvider>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/new" element={<ProjectForm />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="projects/:id/edit" element={<ProjectForm />} />
                <Route path="components" element={<Gallery />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <Toasts />
        </BrowserRouter>
      </PreferencesProvider>
    </ErrorBoundary>
  )
}
