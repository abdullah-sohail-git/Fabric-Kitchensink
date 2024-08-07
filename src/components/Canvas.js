import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

const Canvas = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [savedState, setSavedState] = useState(null);
  const [fillColor, setFillColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [imageWidth, setImageWidth] = useState(150);
  const [imageHeight, setImageHeight] = useState(150);

  useEffect(() => {
    canvasInstance.current = new fabric.Canvas(canvasRef.current);
    canvasInstance.current.setHeight(500);
    canvasInstance.current.setWidth(500);

    const handleSelection = (e) => {
      const target = e.target;
      setSelectedObject(target);
      setFillColor(target.fill || "#000000");
      setStrokeColor(target.stroke || "#000000");
      if (target.type === "i-text") {
        setTextContent(target.text);
        setBackgroundColor(target.backgroundColor || "#ffffff");
        // target.enterEditing();
      } else if (target.type === "image") {
        setImageWidth(target.width || 150);
        setImageHeight(target.height || 150);
      }
    };
    const handleModify = (e) => {
      if (e.target) {
        setImageWidth(e.target.getScaledWidth() || 150);
        setImageHeight(e.target.getScaledHeight() || 150);
        console.log("width", e.target.getScaledWidth());
        console.log("width", e.target.getScaledHeight());
      }
    };

    canvasInstance.current.on("selection:created", handleSelection);
    canvasInstance.current.on("selection:updated", handleSelection);
    canvasInstance.current.on("object:modified", handleModify);
    canvasInstance.current.on("selection:cleared", () => {
      setSelectedObject(null);
      setTextContent("");
      setFillColor("#000000");
      setStrokeColor("#000000");
      setBackgroundColor("#ffffff");
      setImageWidth(150);
      setImageHeight(150);
    });

    return () => {
      canvasInstance.current.dispose();
    };
  }, []);

  const getRandomPosition = (objectWidth, objectHeight) => {
    const canvasWidth = canvasInstance.current.getWidth();
    const canvasHeight = canvasInstance.current.getHeight();
    const left = Math.random() * (canvasWidth - objectWidth);
    const top = Math.random() * (canvasHeight - objectHeight);
    return { left, top };
  };

  const addRectangle = () => {
    const { left, top } = getRandomPosition(100, 100);
    const rect = new fabric.Rect({
      left,
      top,
      fill: "#ff0000",
      width: 100,
      height: 100,
      stroke: "black",
      strokeWidth: 1,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });
    canvasInstance.current.add(rect);
  };

  const addCircle = () => {
    const { left, top } = getRandomPosition(100, 100);
    const circle = new fabric.Circle({
      left,
      top,
      radius: 50,
      fill: "#00ff00",
      stroke: "black",
      strokeWidth: 1,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });
    canvasInstance.current.add(circle);
  };

  const addText = () => {
    const { left, top } = getRandomPosition(100, 20);
    const text = new fabric.IText("Editable Text", {
      left,
      top,
      fontSize: 20,
      fill: "#000000",
      backgroundColor: "#f0f0f0",
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockScalingFlip: true,
    });
    canvasInstance.current.add(text);
    canvasInstance.current.setActiveObject(text);
  };

  const addImage = () => {
    const { left, top } = getRandomPosition(imageWidth, imageHeight);
    fabric.Image.fromURL(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuxNRKW53yk-7EKjY7bJRb9rQx16XK_5PCPw&s",
      (img) => {
        img.set({
          left,
          top,
          angle: 0,
          width: imageWidth,
          height: imageHeight,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });
        canvasInstance.current.add(img);
        canvasInstance.current.setActiveObject(img);
      }
    );
  };

  const addPath = () => {
    const { left, top } = getRandomPosition(100, 100);
    const path = new fabric.Path("M 100 100 L 200 200 L 100 200 Z", {
      fill: "#0000ff",
      stroke: "black",
      strokeWidth: 2,
      left,
      top,
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });
    canvasInstance.current.add(path);
  };

  const updateObject = (key, value) => {
    if (selectedObject) {
      selectedObject.set({ [key]: value });
      selectedObject.setCoords();
      canvasInstance.current.renderAll();
      setSelectedObject(selectedObject);
    }
  };

  const handleTextChange = (e) => {
    setTextContent(e.target.value);
    if (selectedObject && selectedObject.type === "i-text") {
      selectedObject.set({ text: e.target.value });
      selectedObject.setCoords();
      canvasInstance.current.renderAll();
    }
  };

  const handleColorChange = (e, key) => {
    const color = e.target.value;
    if (key === "fill") {
      setFillColor(color);
    } else if (key === "stroke") {
      setStrokeColor(color);
    } else if (key === "backgroundColor") {
      setBackgroundColor(color);
    }
    updateObject(key, color);
  };

  const handleImageWidthChange = (e) => {
    const width = parseInt(e.target.value, 10);
    setImageWidth(width);
    if (selectedObject && selectedObject.type === "image") {
      selectedObject.set({ width });
      selectedObject.setCoords();
      canvasInstance.current.renderAll();
    }
  };

  const handleImageHeightChange = (e) => {
    const height = parseInt(e.target.value, 10);
    setImageHeight(height);
    if (selectedObject && selectedObject.type === "image") {
      selectedObject.set({ height });
      selectedObject.setCoords();
      canvasInstance.current.renderAll();
    }
  };

  const clearCanvas = () => {
    setSavedState(canvasInstance.current.toJSON());
    canvasInstance.current.clear();
    setSelectedObject(null);
    setTextContent("");
    setFillColor("#000000");
    setStrokeColor("#000000");
    setBackgroundColor("#ffffff");
    setImageWidth(150);
    setImageHeight(150);
  };

  const restoreCanvas = () => {
    if (savedState) {
      canvasInstance.current.loadFromJSON(savedState, () => {
        canvasInstance.current.renderAll();
      });
      setSavedState(null);
      setSelectedObject(null);
      setTextContent("");
      setFillColor("#000000");
      setStrokeColor("#000000");
      setBackgroundColor("#ffffff");
      setImageWidth(150);
      setImageHeight(150);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div>
        <canvas id="canv" ref={canvasRef} />
        <button
          onClick={addRectangle}
          style={{ fontSize: 20, backgroundColor: "lightgrey", marginTop: 15 }}
        >
          Rectangle
        </button>
        <button
          onClick={addCircle}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Circle
        </button>
        <button
          onClick={addText}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Text
        </button>
        <button
          onClick={addImage}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Image
        </button>
        <button
          onClick={addPath}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Path
        </button>
        <button
          onClick={clearCanvas}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Clear
        </button>
        <button
          onClick={restoreCanvas}
          style={{
            fontSize: 20,
            backgroundColor: "lightgrey",
            marginLeft: 5,
            marginTop: 15,
          }}
        >
          Restore
        </button>
      </div>
      <div style={{ marginLeft: "20px" }}>
        {selectedObject && selectedObject.type !== "image" && (
          <div>
            <h1>Properties</h1>
            <div>
              <label style={{ fontSize: 20 }}>
                Fill :
                <input
                  type="color"
                  style={{ fontSize: 20, marginLeft: 5 }}
                  value={fillColor}
                  onChange={(e) => handleColorChange(e, "fill")}
                />
              </label>
            </div>
            <div>
              <label style={{ fontSize: 20 }}>
                Stroke :
                <input
                  type="color"
                  style={{ fontSize: 20, marginLeft: 5 }}
                  value={strokeColor}
                  onChange={(e) => handleColorChange(e, "stroke")}
                />
              </label>
            </div>
            {selectedObject.type === "i-text" && (
              <div>
                <label style={{ fontSize: 20 }}>
                  Background Color :
                  <input
                    type="color"
                    style={{ fontSize: 20, marginLeft: 5 }}
                    value={backgroundColor}
                    onChange={(e) => handleColorChange(e, "backgroundColor")}
                  />
                </label>
              </div>
            )}
            {selectedObject.type === "i-text" && (
              <div>
                <label style={{ fontSize: 20 }}>
                  Text :
                  <input
                    style={{ fontSize: 20, marginTop: 10, marginLeft: 5 }}
                    type="text"
                    value={textContent}
                    onChange={handleTextChange}
                  />
                </label>
              </div>
            )}
          </div>
        )}
        {selectedObject && selectedObject.type === "image" && (
          <div>
            <h1>Image Properties</h1>
            <div>
              <label style={{ fontSize: 20 }}>
                Width :
                <input
                  type="number"
                  style={{ fontSize: 20, marginLeft: 5 }}
                  value={imageWidth}
                  onChange={handleImageWidthChange}
                />
              </label>
            </div>
            <div>
              <label style={{ fontSize: 20 }}>
                Height :
                <input
                  type="number"
                  style={{ fontSize: 20, marginLeft: 5 }}
                  value={imageHeight}
                  onChange={handleImageHeightChange}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
