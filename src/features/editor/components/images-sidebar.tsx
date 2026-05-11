import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { useGetImages } from "@/features/images/api/use-get-images";
import { UploadButton } from "@/lib/uploadthing";

interface ImagesSidebarProps {
  editor?: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ImagesSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImagesSidebarProps) => {
  const { data, isLoading, isError } = useGetImages()

  // console.log("data======", data);
  
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-40 w-[360] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Image"
        description="Add image to your canvas"
      />
      <div className="p-4 border-b">
        <UploadButton
          appearance={{
            button: "w-full text-sm font-medium",
            allowedContent: "hidden"
          }}
          content={{
            button: "Upload Image"
          }}
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            editor?.addImage(res[0].ufsUrl);
          }}
        />
      </div>
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Failed to fetch images
          </p>
        </div>
      )}
      <ScrollArea className="h-[calc(100%-68px)]">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data && data.images.map((image) => {
              return (
                <button
                  onClick={() => editor?.addImage(image.urls.regular)}
                  key={image.id}
                  className="relative w-full h-[100] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                >
                  <Image
                    fill
                    src={image.urls.small}
                    alt={image.alt_description || "Image"}
                    className="object-cover"
                  />
                  <Link
                    target="_blank"
                    href={image.links.html}
                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                  >
                    {image.user.name}
                  </Link>
                </button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
