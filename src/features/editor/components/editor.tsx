"use client"
import { useCallback, useState } from "react"
import { fabric } from "fabric"
import { useEffect, useRef } from "react"
import { useEditor } from "@/features/editor/hooks/use-editor"
import { Sidebar } from "@/features/editor/components/sidebar"
import { Navbar } from "@/features/editor/components/navbar"
import { Toolbar } from "@/features/editor/components/toolbar"
import { Footer } from "@/features/editor/components/footer"

import type { ActiveTool } from "@/features/editor/types"
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar"

export const Editor = () => {

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  
  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      
    }

    if (activeTool === "draw") {
      
    }

    if (tool === activeTool) {
      return setActiveTool("select");
    }
    
    setActiveTool(tool);
  }, [activeTool]);

  const { init, editor} = useEditor()

  const canvasRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true
    })

    init({
        initialCanvas: canvas,
        initialContainer: containerRef.current!
    })

    return () => {
        canvas.dispose();
    }
  }, [init])

  return (
    <div className="h-full flex flex-col">
      <Navbar 
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
      />
      <div className="h-[calc(100%-68px)] w-full top-[68] flex">
        <Sidebar 
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto realtive flex flex-col">
          <Toolbar />
          <div className="flex-1 h-[calc(100%-124px)] bg-muted" ref={containerRef}>
            <canvas ref={canvasRef}></canvas>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
