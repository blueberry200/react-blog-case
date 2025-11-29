import { useNavigate } from "react-router";

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky flex justify-between items-center w-full h-20 px-10 bg-blue-700 z-100">
        <div className="text-3xl font-black text-white">React案例展示t</div>
        <div
          className="text-xl font-black text-white hover:cursor-pointer"
          onClick={() => navigate("/")}
        >
          回目錄
        </div>
      </div>
      {children}
    </div>
  );
}
