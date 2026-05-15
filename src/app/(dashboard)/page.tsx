import { auth } from "@/auth"
import { protectServer } from "@/features/auth/utils";
import { Banner } from "./banner";
import { ProjectSection } from "./projects-section";
import { TemplatesSection } from "./templates-section";

export default async function Home() {
  
  await protectServer();

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto pb-10">
      <Banner />
      <TemplatesSection />
      <ProjectSection />
    </div>
  );
}
