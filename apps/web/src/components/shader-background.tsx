"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export function ShaderBackground() {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0 }}
      pointerEvents="none"
      className="-z-10"
      fov={40}
      pixelDensity={2.9}
    >
      <ShaderGradient
        animate="on"
        brightness={0.8}
        cAzimuthAngle={180}
        cDistance={2.11}
        cPolarAngle={90}
        cameraZoom={1}
        color1="#606080"
        color2="#8d7dca"
        color3="#212121"
        envPreset="city"
        grain="on"
        lightType="3d"
        loop="on"
        loopDuration={10}
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        range="enabled"
        rangeEnd={10}
        rangeStart={0}
        reflection={0.1}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        shader="defaults"
        toggleAxis={false}
        type="waterPlane"
        uAmplitude={1}
        uDensity={2.6}
        uFrequency={5.5}
        uSpeed={0.3}
        uStrength={3.7}
        wireframe={false}
        zoomOut={false}
      />
    </ShaderGradientCanvas>
  );
}
