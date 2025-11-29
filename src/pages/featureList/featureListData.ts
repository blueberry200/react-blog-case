type Feature = {
  id: number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  landingPageRoute: string;
  relatedPages: { route: string; name: string; imageUrl: string }[];
  skills: string[];
};

export const featureListData = [
  {
    id: 1,
    title: "清單維護模組",
    description: "這是模組一的描述",
    content: "這是模組一的內容",
    imageUrl:
      "https://cdn.pixabay.com/photo/2025/10/23/05/43/bird-9910830_1280.jpg",
    landingPageRoute: "/feature/listDataManagement/searchPage",
    relatedPages: [
      {
        route: "/feature/listDataManagement/searchPage",
        name: "清單頁",
        imageUrl: "",
      },
      {
        route: "/feature/listDataManagement/addPage",
        name: "新增頁",
        imageUrl: "",
      },
      {
        route: "/feature/listDataManagement/editPage/",
        name: "編輯頁",
        imageUrl: "",
      },
    ],
    skills: ["react", "shadcn", "pagination", "form"],
  },
  {
    id: 2,
    title: "上傳模組",
    description: "這是模組二的描述",
    content: "這是模組二的內容",
    imageUrl: "",
    landingPageRoute: "/feature/uploadModule/uploadResult",
    relatedPages: [
      {
        route: "/feature/uploadModule/uploadResult",
        name: "結果頁",
        imageUrl: "",
      },
      {
        route: "/feature/uploadModule/uploadAction",
        name: "上傳頁",
        imageUrl: "",
      },
    ],
    skills: ["react", "shadcn", "pagination", "form"],
  },
  {
    id: 3,
    title: "模組三",
    description: "這是模組三的描述",
    content: "這是模組三的內容",
    imageUrl: "",
    landingPageRoute: "",
    relatedPages: [
      {
        route: "",
        name: "清單頁",
        imageUrl: "",
      },
      {
        route: "",
        name: "新增頁",
        imageUrl: "",
      },
      {
        route: "",
        name: "編輯頁",
        imageUrl: "",
      },
    ],
    skills: ["react", "shadcn", "pagination", "form"],
  },
] as Feature[];
