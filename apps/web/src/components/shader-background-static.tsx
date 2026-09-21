"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export function ShaderBackgroundStatic() {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pointerEvents="none"
      className="-z-10"
      fov={45}
      pixelDensity={1}
    >
      <ShaderGradient
        animate="off"
        brightness={1.2}
        cAzimuthAngle={180}
        cDistance={3.6}
        cPolarAngle={90}
        cameraZoom={1}
        color1="#606080"
        color2="#8d7dca"
        color3="#212121"
        envPreset="city"
        grain="on"
        lightType="3d"
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        reflection={0.1}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        shader="defaults"
        type="plane"
        uAmplitude={1}
        uDensity={0.5}
        uFrequency={5.5}
        uSpeed={0.4}
        uStrength={0.9}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  );
}
