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
    EditorHookProps
} from "@/features/editor/types";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { isTextType } from "@/features/editor/utils";

const buildEditor = ({ 
    canvas,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    selectedObjects
}: BuildEditorProps): Editor => {

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
            canvas.renderAll();
        },

        changeStrokeWidth: (value: number) => {
            setStrokeWidth(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeWidth: value });
            }); 
            canvas.renderAll();
        },

        addCircle: () => {
            const object = new fabric.Circle({
                ...CIRCLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth
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
                strokeWidth: strokeWidth
            })

            addToCanvas(object);
        },

        addRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth
            })

            addToCanvas(object);
        },

        addTriangle: () => {
            const object = new fabric.Triangle({
                ...TRIANGLE_OPTIONS,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth
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
                    strokeWidth: strokeWidth
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
                strokeWidth: strokeWidth
                }
            );
            addToCanvas(object);
        },
        canvas,
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
                return fillColor;
            }

            const value = slectedObject.get("stroke") || strokeColor;

            return value as string;
        },

        getActiveStrokeWidth: () => strokeWidth,
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


    useAutoResize({
        canvas,
        container
    })

    useCanvasEvents({
        save: () => {},
        canvas,
        setSelectedObjects,
        clearSelectionCallback
    })

    const editor = useMemo(() => {
        if (canvas) {
            return buildEditor({ 
                canvas,
                fillColor,
                strokeColor,
                strokeWidth,
                setFillColor,
                setStrokeColor,
                setStrokeWidth,
                selectedObjects
            })
        }
        return undefined
    }, [
        canvas,
        fillColor,
        strokeColor,
        strokeWidth,
        selectedObjects
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

        // const test = new fabric.Rect({
        //     width: 100,
        //     height: 100,
        //     fill: "black"
        // })

        // initialCanvas.add(test)
        // initialCanvas.centerObject(test)
    }, []);

    return { init, editor }
}