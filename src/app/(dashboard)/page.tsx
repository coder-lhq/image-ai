import { auth } from "@/auth"
import { protectServer } from "@/features/auth/utils";
import { Banner } from "./banner";

export default async function Home() {
  
  await protectServer();
  const session = await auth()

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto pb-10">
      <Banner />
      { JSON.stringify(session) }
    </div>
  );
}
