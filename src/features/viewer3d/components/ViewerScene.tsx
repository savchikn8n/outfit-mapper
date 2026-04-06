import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, Grid } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { avatarPresets } from "../../avatar/presets";
import { AvatarGender, CameraPreset, MannequinPresetId } from "../../../types/app";

interface ViewerSceneProps {
  textureCanvas: HTMLCanvasElement;
  textureRevision: number;
  shirtBaseColor: string;
  backgroundColor: string;
  wireframe: boolean;
  mannequinPreset: MannequinPresetId;
  avatarGender: AvatarGender;
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
  avatarGender,
  cameraPreset,
  onViewportReady
}: ViewerSceneProps) => {
  const orbitRef = useRef<any>(null);
  const shirtMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { camera, gl, scene } = useThree();

  const preset = useMemo(
    () => avatarPresets.find((entry) => entry.id === mannequinPreset) ?? avatarPresets[1],
    [mannequinPreset]
  );

  const genderProfile = useMemo(
    () =>
      avatarGender === "female"
        ? {
            shoulderWidth: 0.84,
            torsoWidth: 0.7,
            hipWidth: 0.8,
            armOffset: 0.88,
            armRotation: 0.26,
            headScale: [0.96, 1, 0.96] as [number, number, number],
            chestY: 1.52,
            legOffset: 0.3
          }
        : {
            shoulderWidth: 0.96,
            torsoWidth: 0.8,
            hipWidth: 0.72,
            armOffset: 0.98,
            armRotation: 0.34,
            headScale: [1, 1, 1] as [number, number, number],
            chestY: 1.56,
            legOffset: 0.33
          },
    [avatarGender]
  );

  const skinColor = avatarGender === "female" ? "#c7947d" : "#b9876f";
  const shirtColor = shirtBaseColor;

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
        <mesh position={[0, 0.62, 0]} castShadow>
          <capsuleGeometry args={[0.16, 1.58, 8, 16]} />
          <meshStandardMaterial color="#242c38" roughness={0.95} />
        </mesh>
        <mesh position={[-genderProfile.legOffset, 0.62, 0]} castShadow>
          <capsuleGeometry args={[0.16, 1.58, 8, 16]} />
          <meshStandardMaterial color="#242c38" roughness={0.95} />
        </mesh>
        <mesh position={[genderProfile.legOffset, 0.62, 0]} castShadow>
          <capsuleGeometry args={[0.16, 1.58, 8, 16]} />
          <meshStandardMaterial color="#242c38" roughness={0.95} />
        </mesh>
        <mesh position={[0, genderProfile.chestY, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[genderProfile.torsoWidth, 1.55, 12, 22]} />
          <meshStandardMaterial color="#8f98aa" roughness={0.88} metalness={0.02} />
        </mesh>
        <mesh position={[0, 2.84, 0]} scale={genderProfile.headScale} castShadow>
          <sphereGeometry args={[0.44, 28, 28]} />
          <meshStandardMaterial color={skinColor} roughness={0.92} metalness={0.01} />
        </mesh>
        <mesh position={[-genderProfile.armOffset, 1.8, 0]} rotation={[0, 0, -genderProfile.armRotation]} castShadow>
          <capsuleGeometry args={[0.18, 1.16, 8, 14]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
        <mesh position={[genderProfile.armOffset, 1.8, 0]} rotation={[0, 0, genderProfile.armRotation]} castShadow>
          <capsuleGeometry args={[0.18, 1.16, 8, 14]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.23, 0.02]} castShadow>
          <sphereGeometry args={[0.47, 24, 24, 0, Math.PI]} />
          <meshStandardMaterial color="#1e222a" roughness={0.96} />
        </mesh>
      </group>

      <group scale={preset.shirtScale}>
        <mesh position={[0, 1.62, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[Math.max(genderProfile.shoulderWidth, genderProfile.torsoWidth) + 0.06, preset.shirtLength, 12, 24]} />
          <meshStandardMaterial
            ref={shirtMaterialRef}
            map={canvasTexture}
            color={shirtColor}
            roughness={0.97}
            metalness={0}
            wireframe={wireframe}
          />
        </mesh>
        <mesh
          position={[-genderProfile.armOffset, 1.84, 0]}
          rotation={[0, 0, -(genderProfile.armRotation + 0.12)]}
          castShadow
        >
          <capsuleGeometry args={[0.24, 0.9, 8, 14]} />
          <meshStandardMaterial
            map={canvasTexture}
            color={shirtColor}
            roughness={0.97}
            metalness={0}
            wireframe={wireframe}
          />
        </mesh>
        <mesh
          position={[genderProfile.armOffset, 1.84, 0]}
          rotation={[0, 0, genderProfile.armRotation + 0.12]}
          castShadow
        >
          <capsuleGeometry args={[0.24, 0.9, 8, 14]} />
          <meshStandardMaterial
            map={canvasTexture}
            color={shirtColor}
            roughness={0.97}
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
        minDistance={2.6}
        maxDistance={8}
        maxPolarAngle={Math.PI / 1.6}
      />
    </>
  );
};
