import { fabric } from "fabric";
import { useCallback, useState, useMemo } from "react";
import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import {
    BuildEditorProps,
    Editor,
    CIRCLE_OPTIONS,
    RECTANGLE_OPTIONS,
    TRIANGLE_OPTIONS,
    DIAMOND_OPTIONS,
    FONT_FAMILY,
    FILL_COLOR,
    STROKE_COLOR,
    STROKE_WIDTH,
    EditorHookProps,
    STROKE_DASH_ARRAY,
    TEXT_OPTIONS,
    FONT_WEIGHT,
    FONT_SIZE,
    JSON_KEYS
} from "@/features/editor/types";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { createFilter, downloadFile, isTextType, transformText } from "@/features/editor/utils";
import { useClipboard } from "@/features/editor/hooks/use-clipboard";
import { useHistory } from "@/features/editor/hooks/use-history";
import { useHotkeys } from "@/features/editor/hooks/use-hotkeys";
import { useWindowEvents } from "@/features/editor/hooks/use-window-events";

const buildEditor = ({
    save, 
    canRedo, 
    canUndo, 
    undo, 
    redo,
    canvas,
    autoZoom,
    copy,
    paste,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    strokeDashArray,
    setStrokeDashArray,
    fontFamily,
    setFontFamily,
    selectedObjects
}: BuildEditorProps): Editor => {
    const generateSaveOptions = () => {
        const { width, height, left, top } = getWorkspace() as fabric.Rect;

        return {
            name: "Image",
            format: "png",
            quality: 1,
            width,
            height,
            left,
            top,
        };
    };

    const savePng = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options);

        downloadFile(dataUrl, "png");
        autoZoom();
    };

    const saveSvg = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options);

        downloadFile(dataUrl, "svg");
        autoZoom();
    };

    const saveJpg = () => {
        const options = generateSaveOptions();

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        const dataUrl = canvas.toDataURL(options);

        downloadFile(dataUrl, "jpg");
        autoZoom();
    };

    const saveJson = async () => {
        const dataUrl = canvas.toJSON(JSON_KEYS);

        await transformText(dataUrl.objects);
        const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataUrl, null, "\t"),
        )}`;
        downloadFile(fileString, "json");
    };

    const loadJson = (json: string) => {
        const data = JSON.parse(json);

        canvas.loadFromJSON(data, () => {
        autoZoom();
        });
    };

    const getWorkspace = () => {
        return canvas
        .getObjects()
        .find((object) => object.name === "clip");
    };

    const center = (object: fabric.Object) => {
        const workspace = getWorkspace(); // get workspace object
        const center = workspace?.getCenterPoint(); // get center point of workspace

        if (!center) return;

        // @ts-ignore
        canvas._centerObject(object, center);
    };

    const addToCanvas = (object: fabric.Object) => {
        center(object);
        canvas.add(object);
        canvas.setActiveObject(object);
    }

    return {
        savePng,
        saveJpg,
        saveSvg,
        saveJson,
        loadJson,
        canRedo, 
        canUndo, 
        autoZoom,
        getWorkspace,
        zoomIn: () => {
            let zoomRatio = canvas.getZoom();
            zoomRatio += 0.05;
            const center = canvas.getCenter();
            canvas.zoomToPoint(
                new fabric.Point(center.left, center.top),
                zoomRatio > 1 ? 1 : zoomRatio
            );
        },
        zoomOut: () => {
            let zoomRatio = canvas.getZoom();
            zoomRatio -= 0.05;
            const center = canvas.getCenter();
            canvas.zoomToPoint(
                new fabric.Point(center.left, center.top),
                zoomRatio < 0.2 ? 0.2 : zoomRatio,
            );
        },
        changeSize: (value: { width: number; height: number }) => {
            const workspace = getWorkspace();

            workspace?.set(value);
            autoZoom();
            save()
        },
        changeBackground: (value: string) => {
            const workspace = getWorkspace();
            workspace?.set({ fill: value });
            canvas.renderAll();
            save()
        },
        enableDrawingMode: () => {
            canvas.discardActiveObject();
            canvas.renderAll();
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = strokeWidth;
            canvas.freeDrawingBrush.color = strokeColor;
        },
        disableDrawingMode: () => {
            canvas.isDrawingMode = false;
        },
        onUndo: () => undo(), 
        onRedo: () => redo(),
        onCopy: () => copy(),
        onPaste: () => paste(),
        changeImageFilter: (value: string) => {
            const objects = canvas.getActiveObjects()
            objects.forEach((object) => {
                if (object.type === "image") {
                    const imageObject = object as fabric.Image

                    const effect = createFilter(value)

                    imageObject.filters = effect ? [effect] : [];
                    imageObject.applyFilters();
                    canvas.renderAll()
                }
            })
        },

        addImage: (value: string) => {
            fabric.Image.fromURL(
                value,
                (image) => {
                    const workspace = getWorkspace()
                    image.scaleToWidth(workspace?.width || 0)
                    image.scaleToHeight(workspace?.height || 0)

                    addToCanvas(image)
                },
                {
                    crossOrigin: "anonymous"
                }
            )
        },
        delete: () => {
            // getActiveObjects and remove
            canvas.getActiveObjects().forEach((object) => canvas.remove(object))
            // 丟棄當前選取
            canvas.discardActiveObject()
            // 重新渲染
            canvas.renderAll()
        },

        addText: (value, options) => {
          const object = new fabric.Textbox(value, {
            ...TEXT_OPTIONS,
            fill: fillColor,
            ...options
          })
          addToCanvas(object)
        },
        
        changeFontUnderline: (value: boolean) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    object.set({ underline: value })
                }
            })
            canvas.renderAll()
        },
        getActiveFontUnderline: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return false;
            }

            // @ts-ignore
            const value = slectedObject.get("underline") || false;

            return value;
        },

        changeFontLinethrough: (value: boolean) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    object.set({ linethrough: value })
                }
            })
            canvas.renderAll()
        },
        getActiveFontLinethrough: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return false;
            }

            // @ts-ignore
            const value = slectedObject.get("linethrough") || false;

            return value;
        },

        changeFontStyle: (value: string) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    object.set({ fontStyle: value })
                }
            })
            canvas.renderAll()
        },

        getActiveFontStyle: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return "notmal";
            }

            // @ts-ignore
            const value = slectedObject.get("fontStyle") || "notmal";

            return value;
        },

        getActiveOpacity: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return 1;
            }

            const value = slectedObject.get("opacity") || 1;

            return value;
        },

        changeOpacity: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                object.set({ opacity: value })
            })
            canvas.renderAll()
        },

        bringForward: () => {
            canvas.getActiveObjects().forEach((object) => {
                canvas.bringForward(object)
            })

            canvas.renderAll()

            // Fix workspace overflow
            const workspace = getWorkspace()
            workspace?.sendBackwards()
        },

        sendBackwards: () => {
             canvas.getActiveObjects().forEach((object) => {
                canvas.sendBackwards(object)
            })

            canvas.renderAll()
            // TODO: Fix workspace overflow
            const workspace = getWorkspace()
            workspace?.sendBackwards()
        },

        changeFontFamily: (value: string) => {
            setFontFamily(value);
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    object.set({ fontFamily: value });
                }
            }); 
            canvas.renderAll();
                
        },

        changeFillColor: (value: string) => {
            setFillColor(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ fill: value });
            }); 
            canvas.renderAll();
                
        },

        changeStrokeColor: (value: string) => {
            setStrokeColor(value);
            canvas.getActiveObjects().forEach((object) => {
                // Text types don't have stroke
                if (isTextType(object.type)) {
                    object.set({ fill: value });
                    return;
                }
                object.set({ stroke: value });
            }); 
            canvas.freeDrawingBrush.color = strokeColor;
            canvas.renderAll();
        },

        changeStrokeWidth: (value: number) => {
            setStrokeWidth(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeWidth: value });
            }); 
            canvas.freeDrawingBrush.width = strokeWidth;
            canvas.renderAll();
        },

        changeStrokeDashArray: (value: number[]) => {
            setStrokeDashArray(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeDashArray: value });
            }); 
            canvas.renderAll();
        },

        addCircle: () => {
            const object = new fabric.Circle({
                ...CIRCLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray
            })

            addToCanvas(object);
        },

        addSoftRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                rx: 50,
                ry: 50,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray
            })

            addToCanvas(object);
        },

        addRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray
            })

            addToCanvas(object);
        },

        addTriangle: () => {
            const object = new fabric.Triangle({
                ...TRIANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                strokeDashArray: strokeDashArray
            })

            addToCanvas(object);
        },

        addInverseTriangle: () => {
            const HEIGHT = TRIANGLE_OPTIONS.height;
            const WIDTH = TRIANGLE_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: 0, y: 0 },
                    { x: WIDTH, y: 0 },
                    { x: WIDTH / 2, y: HEIGHT },
                ],
                {
                    ...TRIANGLE_OPTIONS,
                    fill: fillColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    strokeDashArray: strokeDashArray
                }
            );

            addToCanvas(object);
        },

        addDiamond: () => {
            const HEIGHT = DIAMOND_OPTIONS.height;
            const WIDTH = DIAMOND_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: WIDTH / 2, y: 0 },
                    { x: WIDTH, y: HEIGHT / 2 },
                    { x: WIDTH / 2, y: HEIGHT },
                    { x: 0, y: HEIGHT / 2 },
                ],
                {
                    ...DIAMOND_OPTIONS,
                    fill: fillColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    strokeDashArray: strokeDashArray
                }
            );
            addToCanvas(object);
        },

        getActiveFontFamily: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return fontFamily;
            }
            // @ts-ignore
            const value = slectedObject.get("fontFamily") || fontFamily;

            return value as string;
        },

        getActiveFillColor: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return fillColor;
            }

            const value = slectedObject.get("fill") || fillColor;

            return value as string;
        },

        getActiveStrokeColor: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return strokeColor;
            }

            const value = slectedObject.get("stroke") || strokeColor;

            return value;
        },

        getActiveStrokeWidth: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return strokeWidth;
            }

            const value = slectedObject.get("strokeWidth") || strokeWidth;

            return value;
        },

        getActiveStrokeDashArray: () => {
            const slectedObject = selectedObjects[0];
            if (!slectedObject) {
                return strokeDashArray;
            }

            const value = slectedObject.get("strokeDashArray") || strokeDashArray;

            return value;
        },

        changeFontWeight: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    object.set({ fontWeight: value })
                }
            })
            canvas.renderAll()
        },

        getActiveFontWeight: () => {
            const slectedObject = selectedObjects[0];

            if (!slectedObject) {
                return FONT_WEIGHT;
            }

            // @ts-ignore
            const value = slectedObject.get("fontWeight") || FONT_WEIGHT;
            return value;
        },

        changeTextAlign: (value: string) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    // Faulty TS library, textAlign exists
                    object.set({ textAlign: value })
                }
            })
            canvas.renderAll()
        },
        getActiveTextAlign: () => {
            const slectedObject = selectedObjects[0];

            if (!slectedObject) {
                return "left";
            }

            // @ts-ignore
            // Faulty TS library, textAlign exists
            const value = slectedObject.get("textAlign") || "left";
            return value;
        },

        changeFontSize: (value: number) => {
            canvas.getActiveObjects().forEach((object) => {
                if (isTextType(object.type)) {
                    // @ts-ignore
                    // Faulty TS library, fontSize exists
                    object.set({ fontSize: value })
                }
            })
            canvas.renderAll()
        },
        getActiveFontSize: () => {
            const slectedObject = selectedObjects[0];

            if (!slectedObject) {
                return FONT_SIZE;
            }

            // @ts-ignore
            // Faulty TS library, fontSize exists
            const value = slectedObject.get("fontSize") || FONT_SIZE;
            return value;
        },

        canvas,
        selectedObjects
    }
}

export const useEditor = ({
    clearSelectionCallback
}: EditorHookProps) => {
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([])

    const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
    const [fillColor, setFillColor] = useState(FILL_COLOR);
    const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
    const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

    useWindowEvents();

    const { 
        save, 
        canRedo, 
        canUndo, 
        undo, 
        redo,
        canvasHistory,
        setHistoryIndex,
     } = useHistory({ canvas });

    const {copy, paste } = useClipboard({ canvas })

    const { autoZoom } = useAutoResize({
        canvas,
        container
    })

    useCanvasEvents({
        save,
        canvas,
        setSelectedObjects,
        clearSelectionCallback
    })

    useHotkeys({
        undo,
        redo,
        copy,
        paste,
        save,
        canvas,
    });


    const editor = useMemo(() => {
        if (canvas) {
            return buildEditor({ 
                save, 
                canRedo, 
                canUndo, 
                undo, 
                redo,
                autoZoom,
                copy,
                paste,
                canvas,
                fillColor,
                strokeColor,
                strokeWidth,
                strokeDashArray,
                fontFamily,
                setFillColor,
                setStrokeColor,
                setStrokeWidth,
                setStrokeDashArray,
                selectedObjects,
                setFontFamily
            })
        }
        return undefined
    }, [
        save, 
        canRedo, 
        canUndo, 
        undo, 
        redo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeColor,
        strokeWidth,
        strokeDashArray,
        selectedObjects,
        fontFamily
    ])

    const init = useCallback(({
        initialCanvas,
        initialContainer
    }: {
        initialCanvas: fabric.Canvas,
        initialContainer: HTMLDivElement
    }) => {

        fabric.Object.prototype.set({
            cornerColor: "#FFF",
            cornerStyle: "circle",
            borderColor: "#3b82f6",
            borderScaleFactor: 1.5,
            transparentCorners: false,
            borderOpacityWhenMoving: 1,
            cornerStrokeColor: "#3b82f6",
        });

        // create initial workspace
        const initialWorkspace = new fabric.Rect({
            width: 900,
            height: 1200,
            name: "clip",
            fill: "white",
            selectable: false,
            hasControls: false,
            shadow: new fabric.Shadow({
                color: "rgba(0,0,0,0.8)",
                blur: 5
            })
        })

        // initial canvas widht and height 
        initialCanvas.setWidth(initialContainer.clientWidth)
        initialCanvas.setHeight(initialContainer.clientHeight)

        initialCanvas.add(initialWorkspace)
        initialCanvas.centerObject(initialWorkspace)
        initialCanvas.clipPath = initialWorkspace
        
        setCanvas(initialCanvas)
        setContainer(initialContainer)

        const currentState = JSON.stringify(
            initialCanvas.toJSON(JSON_KEYS)
        );
        canvasHistory.current = [currentState];
        setHistoryIndex(0);
    },
    [
      canvasHistory, // No need, this is from useRef
      setHistoryIndex, // No need, this is from useState
    ]);

    return { init, editor }
}