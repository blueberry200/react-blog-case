import { useNavigate } from "react-router";
import { AppImage } from "@/components/custom/app-image";
import { featureListData } from "./featureListData";

export default function FeatureList() {
  const navigate = useNavigate();

  return (
    <div className="my-5 min-h-screen">
      <div className="text-4xl font-black p-5">模組清單</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 justify-start items-center px-5">
        {featureListData.map((item: any) => (
          <article
            key={item.id}
            className="group mx-auto w-[250px] h-[340px] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 hover:cursor-pointer"
            onClick={() => navigate("/guidePage/" + item.id)}
          >
            <div className="h-1/2 w-full overflow-hidden bg-slate-100">
              <AppImage src={item.imageUrl} alt={item.name || ""} />
            </div>

            <div className="flex h-1/2 flex-col p-4">
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                {item.description}
                這是簡述內容，最多顯示三行。超過三行會用省略號呈現。
                用來放文章摘要、商品描述、或任何你需要的卡片文字。
              </p>

              <div className="mt-auto pt-3 text-xs text-slate-400">
                共{item.relatedPages.length}頁
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
