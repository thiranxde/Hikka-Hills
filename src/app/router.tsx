import { createBrowserRouter } from 'react-router-dom'
import { Root } from '@/app/Root'
import { HomePage } from '@/features/home/pages/HomePage'
import { SiteLayout } from '@/layouts/SiteLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
