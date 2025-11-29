import { useNavigate, useParams } from "react-router";
import { AppImage } from "@/components/custom/app-image";
import { featureListData } from "@/pages/featureList/featureListData";

export default function GuildPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentFeatureData = featureListData.find(
    (item: any) => item.id === Number(id)
  ) ?? {
    id: 0,
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    landingPageRoute: "",
    relatedPages: [],
    skills: [],
  };

  return (
    <div className="flex flex-col items-center my-5">
      <div className="text-4xl font-black p-5 w-full max-w-5xl">模組導覽</div>
      <div className="flex flex-col w-full md:w-3xl px-5">
        <div className="flex flex-col md:flex-row justify-start gap-5 w-full">
          <div className="flex flex-col w-full md:w-1/2 gap-5">
            <div className="grid relative w-full bg-slate-100 before:content-[''] before:block before:pt-[50%] before:col-start-1 before:row-start-1">
              <AppImage
                src={currentFeatureData.imageUrl}
                alt={""}
                className="col-start-1 row-start-1"
              />
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/2 gap-5">
            <div className="text-3xl font-black">
              {currentFeatureData.title}
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="text-xl font-bold">
                相關頁面(共{currentFeatureData.relatedPages.length}頁)：
              </div>
              {currentFeatureData.relatedPages.map((item: any) => (
                <div>
                  <div className="flex items-center bg-purple-700 px-3 text-white rounded-md h-8">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="text-xl font-bold">相關技能:</div>
              {currentFeatureData.skills.map((item: any) => (
                <div>
                  <div className="flex items-center bg-blue-700 px-3 text-white rounded-md h-8">
                    {item}
                  </div>
                </div>
              ))}
            </div>
            <div></div>
          </div>
        </div>
        <div className="flex flex-col md:mt-8">
          <div className="text-xl font-bold">模組介紹：</div>
          <div>{currentFeatureData.content}</div>
        </div>
        <div className="flex justify-center w-full mt-8">
          <button
            className="w-full max-w-lg h-12 bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all duration-200 hover:cursor-pointer rounded-lg"
            onClick={() => navigate(currentFeatureData.landingPageRoute)}
          >
            前往登陸頁
          </button>
        </div>
      </div>
    </div>
  );
}
