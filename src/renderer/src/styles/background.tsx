// NeatBackground.tsx
import { useEffect, useRef } from "react";
import { NeatGradient, NeatConfig } from "@firecms/neat";
import { useColorScheme } from "@mui/joy/styles";

const NeatBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useColorScheme();

  const getBackgroundConfig = (isDark: boolean): NeatConfig => {
    if (isDark) {
      return {
        colors: [
          { color: "#554226", enabled: true },
          { color: "#03162D", enabled: true },
          { color: "#002027", enabled: true },
          { color: "#020210", enabled: true },
          { color: "#02152A", enabled: true },
        ],
        speed: 2,
        horizontalPressure: 3,
        verticalPressure: 5,
        waveFrequencyX: 1,
        waveFrequencyY: 3,
        waveAmplitude: 8,
        shadows: 0,
        highlights: 2,
        colorBrightness: 1,
        colorSaturation: 6,
        wireframe: false,
        colorBlending: 7,
        backgroundColor: "#003FFF",
        backgroundAlpha: 1,
        grainScale: 2,
        grainSparsity: 0,
        grainIntensity: 0.175,
        grainSpeed: 1,
        resolution: 1,
        yOffset: 0,
      };
    }
    return {
      colors: [
        { color: "#FF5772", enabled: true },
        { color: "#4CB4BB", enabled: true },
        { color: "#FFC600", enabled: true },
        { color: "#8B6AE6", enabled: true },
        { color: "#2E0EC7", enabled: true },
      ],
      speed: 3,
      horizontalPressure: 2,
      verticalPressure: 2,
      waveFrequencyX: 2,
      waveFrequencyY: 2,
      waveAmplitude: 2,
      shadows: 1,
      highlights: 1,
      wireframe: false,
      colorBlending: 5,
      backgroundColor: "#000000",
      backgroundAlpha: 1,
    };
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const config = getBackgroundConfig(mode === "dark");
    
    const neat = new NeatGradient({
      ref: canvasRef.current,
      ...config,
    });

    return () => neat.destroy();
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
};

export default NeatBackground;
