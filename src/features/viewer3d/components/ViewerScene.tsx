import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { avatarPresets } from "../../avatar/presets";
import { CameraPreset, MannequinPresetId } from "../../../types/app";

interface ViewerSceneProps {
  textureCanvas: HTMLCanvasElement;
  textureRevision: number;
  shirtBaseColor: string;
  backgroundColor: string;
  wireframe: boolean;
  mannequinPreset: MannequinPresetId;
  cameraPreset: CameraPreset;
  onViewportReady: (canvas: HTMLCanvasElement) => void;
}

const cameraPositions: Record<CameraPreset, [number, number, number]> = {
  front: [0, 1.8, 5],
  back: [0, 1.8, -5],
  left: [-5, 1.8, 0],
  right: [5, 1.8, 0],
  perspective: [3.6, 2.2, 4.6]
};

export const ViewerScene = ({
  textureCanvas,
  textureRevision,
  shirtBaseColor,
  backgroundColor,
  wireframe,
  mannequinPreset,
  cameraPreset,
  onViewportReady
}: ViewerSceneProps) => {
  const orbitRef = useRef<{
    target: THREE.Vector3;
    update: () => void;
  } | null>(null);
  const shirtMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { camera, gl, scene } = useThree();

  const preset = useMemo(
    () => avatarPresets.find((entry) => entry.id === mannequinPreset) ?? avatarPresets[1],
    [mannequinPreset]
  );

  const canvasTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }, [textureCanvas]);

  useEffect(() => {
    onViewportReady(gl.domElement);
  }, [gl.domElement, onViewportReady]);

  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [backgroundColor, scene]);

  useEffect(() => {
    canvasTexture.needsUpdate = true;
    if (shirtMaterialRef.current) {
      shirtMaterialRef.current.map = canvasTexture;
      shirtMaterialRef.current.color = new THREE.Color(shirtBaseColor);
      shirtMaterialRef.current.wireframe = wireframe;
      shirtMaterialRef.current.needsUpdate = true;
    }
  }, [canvasTexture, shirtBaseColor, textureRevision, wireframe]);

  useEffect(() => {
    const position = cameraPositions[cameraPreset];
    camera.position.set(...position);
    camera.lookAt(0, 1.5, 0);
    orbitRef.current?.target.set(0, 1.45, 0);
    orbitRef.current?.update();
  }, [camera, cameraPreset]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.3} />
      <directionalLight position={[-3, 5, -4]} intensity={0.55} />
      <group scale={preset.bodyScale}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.72, 1.9, 10, 18]} />
          <meshStandardMaterial color="#8f98aa" roughness={0.84} metalness={0.02} />
        </mesh>
        <mesh position={[0, 2.9, 0]} castShadow>
          <sphereGeometry args={[0.48, 28, 28]} />
          <meshStandardMaterial color="#98a4ba" roughness={0.88} metalness={0.01} />
        </mesh>
        <mesh position={[-0.98, 1.76, 0]} rotation={[0, 0, -0.35]} castShadow>
          <capsuleGeometry args={[0.19, 1.12, 8, 12]} />
          <meshStandardMaterial color="#8993a6" roughness={0.9} />
        </mesh>
        <mesh position={[0.98, 1.76, 0]} rotation={[0, 0, 0.35]} castShadow>
          <capsuleGeometry args={[0.19, 1.12, 8, 12]} />
          <meshStandardMaterial color="#8993a6" roughness={0.9} />
        </mesh>
      </group>

      <group scale={preset.shirtScale}>
        <mesh position={[0, 1.48, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.86, preset.shirtLength, 10, 22]} />
          <meshStandardMaterial
            ref={shirtMaterialRef}
            map={canvasTexture}
            color={shirtBaseColor}
            roughness={0.92}
            metalness={0}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[-1.05, 1.78, 0]} rotation={[0, 0, -0.46]} castShadow>
          <capsuleGeometry args={[0.24, 0.9, 8, 14]} />
          <meshStandardMaterial
            map={canvasTexture}
            color={shirtBaseColor}
            roughness={0.92}
            metalness={0}
            wireframe={wireframe}
          />
        </mesh>
        <mesh position={[1.05, 1.78, 0]} rotation={[0, 0, 0.46]} castShadow>
          <capsuleGeometry args={[0.24, 0.9, 8, 14]} />
          <meshStandardMaterial
            map={canvasTexture}
            color={shirtBaseColor}
            roughness={0.92}
            metalness={0}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.05, 0]}>
        <circleGeometry args={[6.4, 48]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      <Grid
        position={[0, 0, 0]}
        args={[12, 12]}
        cellColor="#223043"
        sectionColor="#34465d"
        fadeDistance={18}
        fadeStrength={1.4}
      />

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.09}
        minDistance={2.6}
        maxDistance={8}
        maxPolarAngle={Math.PI / 1.6}
      />
    </>
  );
};
