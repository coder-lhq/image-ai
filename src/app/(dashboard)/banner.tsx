"use client";

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/features/projects/api/use-create-projects";
import { useTranslations } from 'next-intl';

export const Banner = () => {
  const router = useRouter()
  const mutation = useCreateProject()
  const t = useTranslations();

  const onClick = () => {
    mutation.mutate(
      {
        name: "Untitled project",
        json: "",
        width: 900,
        height: 1200,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      },
    );
  };
  return (
    <div className="text-white aspect-5/1 min-h-62 flex gap-x-6 p-6 items-center rounded-xl bg-linear-to-r from-[#2e62cb] via-[#0073ff] to-[#3faff5]">
      <div className="rounded-full size-28 items-center justify-center bg-white/50 hidden md:flex">
        <div className="rounded-full size-20 flex items-center justify-center bg-white">
          <Sparkles className="h-20 text-[#0073ff] fill-[#0073ff]" />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <h1 className="text-xl md:text-3xl font-semibold">
          {t("Visualize your ideas with Image AI")}
        </h1>
        <p className="text-xs md:text-sm mb-2">
         {t("Turn inspiration into design in no time Simply upload an image and let AI do the rest")}
        </p>
        <Button
          disabled={mutation.isPending}
          onClick={onClick}
          variant="secondary"
          className="w-40"
        >
          {t("Start creating")}
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
    )
}
