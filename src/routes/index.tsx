import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import GlobalLayout from "@/components/layout/global-layout";
import FeatureListPage from "@/pages/featureList/featureList";
import GuidePage from "@/pages/guidePage/guildPage";

// ListDataManagement
import ListDataManagementSearchPage from "@/pages/feature/listDataManagement/searchPage";
import ListDataManagementAddPage from "@/pages/feature/listDataManagement/addPage";
import ListDataManagementEditPage from "@/pages/feature/listDataManagement/editPage";

// uploadModule
import UploadAction from "@/pages/feature/uploadModule/uploadAction";
import UploadResult from "@/pages/feature/uploadModule/uploadResult";

// 統一的 route 設定
const routes = [
  {
    path: "/",
    element: (
      <GlobalLayout>
        <Outlet />
      </GlobalLayout>
    ),
    children: [
      { index: true, element: <FeatureListPage /> },
      { path: "guidePage/:id", element: <GuidePage /> },

      // ListDataManagement
      {
        path: "feature/listDataManagement/searchPage",
        element: <ListDataManagementSearchPage />,
      },
      {
        path: "feature/listDataManagement/addPage",
        element: <ListDataManagementAddPage />,
      },
      {
        path: "feature/listDataManagement/editPage",
        element: <ListDataManagementEditPage />,
      },

      // uploadModule
      {
        path: "feature/uploadModule/uploadAction",
        element: <UploadAction />,
      },
      {
        path: "feature/uploadModule/uploadResult",
        element: <UploadResult />,
      },
    ],
  },
];

// 判斷是不是跑在 GitHub Pages（例如 your-name.github.io）
const isGithubPages = window.location.hostname.endsWith("github.io");

// GitHub Pages → Hash Router，其它情況 → Browser Router
const router = isGithubPages
  ? createHashRouter(routes)
  : createBrowserRouter(routes);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
