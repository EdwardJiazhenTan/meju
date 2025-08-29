"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import Navbar from "@/components/Navbar";

// TODO: Change language to english
export default function Ocr() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 图像预处理
  const preprocessImage = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      img.onload = () => {
        // 设置canvas尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 简单的对比度增强
        for (let i = 0; i < data.length; i += 4) {
          // 转换为灰度
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

          // 增强对比度
          const enhanced = gray > 128 ? 255 : 0;

          data[i] = enhanced; // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
          // Alpha保持不变
        }

        // 写回canvas
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      // 预处理图像
      const processedCanvas = await preprocessImage(file);

      // 显示处理后的图像（可选）
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")!;
        canvasRef.current.width = processedCanvas.width;
        canvasRef.current.height = processedCanvas.height;
        ctx.drawImage(processedCanvas, 0, 0);
      }

      // OCR识别
      const {
        data: { text },
      } = await Tesseract.recognize(processedCanvas, "chi_sim+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setResult(text.trim());
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">增强版OCR识别</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：上传和预览 */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {loading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center mt-1">{progress}%</p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="max-w-full border rounded"
            style={{ display: canvasRef.current?.width ? "block" : "none" }}
          />
        </div>

        {/* 右侧：识别结果 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">识别结果</h3>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="w-full h-64 p-3 border rounded-md"
            placeholder="OCR识别结果将显示在这里..."
          />
        </div>
      </div>
      </div>
    </div>
  );
}
