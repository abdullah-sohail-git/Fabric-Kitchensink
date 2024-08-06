import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

const Canvas = () => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [savedState, setSavedState] = useState(null);

  useEffect(() => {
    canvasInstance.current = new fabric.Canvas(canvasRef.current);
    canvasInstance.current.setHeight(500);
    canvasInstance.current.setWidth(500);

    canvasInstance.current.on("selection:created", (e) => {
      setSelectedObject(e.target);
      if (e.target.type === "i-text") {
        setTextContent(e.target.text);
        e.target.enterEditing();
      }
    });

    canvasInstance.current.on("selection:updated", (e) => {
      setSelectedObject(e.target);
      if (e.target.type === "i-text") {
        setTextContent(e.target.text);
        e.target.enterEditing();
      }
    });

    canvasInstance.current.on("selection:cleared", () => {
      setSelectedObject(null);
      setTextContent("");
    });

    // Clean up on component unmount
    return () => {
      canvasInstance.current.dispose();
    };
  }, []);

  const addRectangle = () => {
    const rect = new fabric.Rect({
      left: 40,
      top: 50,
      fill: "#ff0000",
      width: 100,
      height: 100,
      stroke: "black",
      strokeWidth: 1,
    });
    canvasInstance.current.add(rect);
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 100,
      top: 170,
      radius: 50,
      fill: "#00ff00",
      stroke: "black",
      strokeWidth: 1,
    });
    canvasInstance.current.add(circle);
  };

  const addText = () => {
    const text = new fabric.IText("Editable Text", {
      left: 80,
      top: 300,
      fontSize: 20,
      fill: "#000000",
      backgroundColor: "#f0f0f0", // Add background color to text
    });
    canvasInstance.current.add(text);
  };

  const addImage = () => {
    fabric.Image.fromURL(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuxNRKW53yk-7EKjY7bJRb9rQx16XK_5PCPw&s",
      (img) => {
        img.set({
          left: 250,
          top: 200,
          angle: 0,
          width: 150,
          height: 150,
        });
        canvasInstance.current.add(img);
      }
    );
  };

  const addPath = () => {
    const path = new fabric.Path("M 100 100 L 200 200 L 100 200 Z", {
      fill: "#0000ff",
      stroke: "black",
      strokeWidth: 2,
      left: 200,
      top: 50,
    });
    canvasInstance.current.add(path);
  };

  const updateObject = (key, value) => {
    if (selectedObject) {
      if (key === "left" || key === "top") {
        value = parseFloat(value) || 0;
      }
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
    updateObject(key, e.target.value);
  };

  const clearCanvas = () => {
    setSavedState(canvasInstance.current.toJSON()); // Save the current state
    canvasInstance.current.clear();
    setSelectedObject(null);
    setTextContent("");
  };

  const restoreCanvas = () => {
    if (savedState) {
      canvasInstance.current.loadFromJSON(savedState, () => {
        canvasInstance.current.renderAll();
      });
      setSavedState(null);
      setSelectedObject(null);
      setTextContent("");
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
                  value={selectedObject.fill || "#000000"} // Default to black if no fill color
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
                  value={selectedObject.stroke || "#000000"} // Default to black if no stroke color
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
                    value={selectedObject.backgroundColor || "#ffffff"} // Default to white if no background color
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
      </div>
    </div>
  );
};

export default Canvas;
