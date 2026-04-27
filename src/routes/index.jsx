import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import MorePage from '../pages/MorePage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RequireRole from './RequireRole.jsx'
import ChefCreatePage from '../pages/chefs/ChefCreatePage.jsx'
import ChefDetailsPage from '../pages/chefs/ChefDetailsPage.jsx'
import ChefEditPage from '../pages/chefs/ChefEditPage.jsx'
import ChefsListPage from '../pages/chefs/ChefsListPage.jsx'
import DeveloperCreatePage from '../pages/developers/DeveloperCreatePage.jsx'
import DeveloperDetailsPage from '../pages/developers/DeveloperDetailsPage.jsx'
import DeveloperEditPage from '../pages/developers/DeveloperEditPage.jsx'
import DevelopersListPage from '../pages/developers/DevelopersListPage.jsx'
import ManagerCreatePage from '../pages/managers/ManagerCreatePage.jsx'
import ManagerDetailsPage from '../pages/managers/ManagerDetailsPage.jsx'
import ManagerEditPage from '../pages/managers/ManagerEditPage.jsx'
import ManagersListPage from '../pages/managers/ManagersListPage.jsx'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage.jsx'
import ProjectAssignPage from '../pages/projects/ProjectAssignPage.jsx'
import ProjectDetailsPage from '../pages/projects/ProjectDetailsPage.jsx'
import ProjectEditPage from '../pages/projects/ProjectEditPage.jsx'
import ProjectFilesPage from '../pages/projects/ProjectFilesPage.jsx'
import ProjectsListPage from '../pages/projects/ProjectsListPage.jsx'
import SlaProjectCreatePage from '../pages/sla/SlaProjectCreatePage.jsx'
import SlaProjectDetailsPage from '../pages/sla/SlaProjectDetailsPage.jsx'
import SlaProjectEditPage from '../pages/sla/SlaProjectEditPage.jsx'
import SlaProjectsListPage from '../pages/sla/SlaProjectsListPage.jsx'
import TaskCreatePage from '../pages/tasks/TaskCreatePage.jsx'
import TaskDetailsPage from '../pages/tasks/TaskDetailsPage.jsx'
import TaskEditPage from '../pages/tasks/TaskEditPage.jsx'
import TasksListPage from '../pages/tasks/TasksListPage.jsx'
import { APP_ROLES } from '../auth/roles.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'more',
            element: <MorePage />,
          },
          {
            element: (
              <RequireRole
                allowedRoles={[
                  APP_ROLES.MANAGER,
                  APP_ROLES.CHEF_DE_PROJET,
                  APP_ROLES.DEVELOPER,
                ]}
              />
            ),
            children: [
              {
                path: 'projects',
                element: <ProjectsListPage />,
              },
              {
                path: 'projects/:id',
                element: <ProjectDetailsPage />,
              },
              {
                path: 'developers/:id',
                element: <DeveloperDetailsPage />,
              },
              {
                path: 'tasks',
                element: <TasksListPage />,
              },
              {
                path: 'tasks/:id',
                element: <TaskDetailsPage />,
              },
            ],
          },
          {
            element: (
              <RequireRole
                allowedRoles={[
                  APP_ROLES.MANAGER,
                  APP_ROLES.CHEF_DE_PROJET,
                ]}
              />
            ),
            children: [
              {
                path: 'chefs',
                element: <ChefsListPage />,
              },
              {
                path: 'chefs/:id',
                element: <ChefDetailsPage />,
              },
              {
                path: 'developers',
                element: <DevelopersListPage />,
              },
              {
                path: 'sla-projects',
                element: <SlaProjectsListPage />,
              },
              {
                path: 'sla-projects/:id',
                element: <SlaProjectDetailsPage />,
              },
            ],
          },
          {
            element: <RequireRole allowedRoles={[APP_ROLES.MANAGER]} />,
            children: [
              {
                path: 'projects/create',
                element: <ProjectCreatePage />,
              },
              {
                path: 'projects/:id/edit',
                element: <ProjectEditPage />,
              },
              {
                path: 'projects/:id/files',
                element: <ProjectFilesPage />,
              },
              {
                path: 'managers',
                element: <ManagersListPage />,
              },
              {
                path: 'managers/create',
                element: <ManagerCreatePage />,
              },
              {
                path: 'managers/:id',
                element: <ManagerDetailsPage />,
              },
              {
                path: 'managers/:id/edit',
                element: <ManagerEditPage />,
              },
              {
                path: 'managers/:managerId/projects/create',
                element: <ProjectCreatePage />,
              },
              {
                path: 'managers/:managerId/projects/:projectId/assign',
                element: <ProjectAssignPage />,
              },
              {
                path: 'managers/:managerId/projects/:projectId',
                element: <ProjectDetailsPage />,
              },
              {
                path: 'chefs/create',
                element: <ChefCreatePage />,
              },
              {
                path: 'chefs/:id/edit',
                element: <ChefEditPage />,
              },
              {
                path: 'developers/create',
                element: <DeveloperCreatePage />,
              },
              {
                path: 'developers/:id/edit',
                element: <DeveloperEditPage />,
              },
              {
                path: 'tasks/create',
                element: <TaskCreatePage />,
              },
              {
                path: 'tasks/:id/edit',
                element: <TaskEditPage />,
              },
              {
                path: 'sla-projects/create',
                element: <SlaProjectCreatePage />,
              },
              {
                path: 'sla-projects/:id/edit',
                element: <SlaProjectEditPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])

export default router
