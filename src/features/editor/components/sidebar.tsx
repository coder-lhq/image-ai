"use client";

import { 
  LayoutTemplate,
  ImageIcon,
  Pencil,
  Settings,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";

import { ActiveTool } from "@/features/editor/types";
import { SidebarItem } from "@/features/editor/components/sidebar-item";
import { useTranslations } from 'next-intl';

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({ activeTool, onChangeActiveTool }: SidebarProps) => {
    const t = useTranslations();
    return (
        <aside className="bg-white flex flex-colh-full border-r overflow-y-auto">
            <ul className="flex flex-col">
                <SidebarItem
                    icon={LayoutTemplate}
                    label={t("Design")}
                    isActive={activeTool === "templates"}
                    onClick={() => onChangeActiveTool("templates")}
                />
                <SidebarItem
                    icon={ImageIcon}
                    label={t("Image")}
                    isActive={activeTool === "images"}
                    onClick={() => onChangeActiveTool("images")}
                />
                <SidebarItem
                    icon={Type}
                    label={t("Text")}
                    isActive={activeTool === "text"}
                    onClick={() => onChangeActiveTool("text")}
                />
                <SidebarItem
                    icon={Shapes}
                    label={t("Shape")}
                    isActive={activeTool === "shapes"}
                    onClick={() => onChangeActiveTool("shapes")}
                />
                <SidebarItem
                    icon={Pencil}
                    label={t("Draw")}
                    isActive={activeTool === "draw"}
                    onClick={() => onChangeActiveTool("draw")}
                />
                <SidebarItem
                    icon={Sparkles}
                    label={t("AI")}
                    isActive={activeTool === "ai"}
                    onClick={() => onChangeActiveTool("ai")}
                />
                <SidebarItem
                    icon={Settings}
                    label={t("Settings")}
                    isActive={activeTool === "settings"}
                    onClick={() => onChangeActiveTool("settings")}
                />
            </ul>
        </aside>
    )
}