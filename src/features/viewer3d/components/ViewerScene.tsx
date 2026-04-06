import { useEffect, useMemo, useRef } from "react";
import { Decal, OrbitControls, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { avatarPresets } from "../../avatar/presets";
import {
  ArtworkLayer,
  AvatarGender,
  CameraPreset,
  MannequinPresetId
} from "../../../types/app";
import { MODEL_URL } from "../modelHackConfig";
import { useDecalTextures } from "../hooks/useDecalTextures";

interface ViewerSceneProps {
  artworkLayers: ArtworkLayer[];
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
  artworkLayers,
  textureRevision,
  backgroundColor,
  wireframe,
  mannequinPreset,
  avatarGender,
  cameraPreset,
  onViewportReady
}: ViewerSceneProps) => {
  const orbitRef = useRef<any>(null);
  const { camera, gl, scene } = useThree();
  const gltf = useGLTF(MODEL_URL);

  const preset = useMemo(
    () => avatarPresets.find((entry) => entry.id === mannequinPreset) ?? avatarPresets[1],
    [mannequinPreset]
  );

  const silhouetteScale = useMemo(
    () =>
      avatarGender === "female"
        ? [0.94, 1, 0.96] as [number, number, number]
        : [1, 1.02, 1] as [number, number, number],
    [avatarGender]
  );

  const { textures, readyRevision } = useDecalTextures(artworkLayers, textureRevision);

  const modelScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
      if (!object.geometry.getAttribute("normal")) {
        object.geometry.computeVertexNormals();
      }

      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => material.clone());
      } else {
        object.material = object.material.clone();
      }
    });
    return clone;
  }, [gltf.scene]);

  const targetMesh = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    modelScene.traverse((object) => {
      if (!mesh && object instanceof THREE.Mesh) {
        mesh = object;
      }
    });
    return mesh;
  }, [modelScene]);

  const modelPlacement = useMemo(() => {
    const box = new THREE.Box3().setFromObject(modelScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxSize = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.7 / maxSize;

    return {
      scale,
      size,
      center,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [
        number,
        number,
        number
      ]
    };
  }, [modelScene]);

  useEffect(() => {
    onViewportReady(gl.domElement);
  }, [gl.domElement, onViewportReady]);

  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [backgroundColor, scene]);

  useEffect(() => {
    const position = cameraPositions[cameraPreset];
    camera.position.set(...position);
    camera.lookAt(0, 1.5, 0);
    orbitRef.current?.target.set(0, 1.45, 0);
    orbitRef.current?.update();
  }, [camera, cameraPreset]);

  const frontVisible = readyRevision > 0;
  const backVisible = readyRevision > 0;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={1.25} castShadow />
      <directionalLight position={[-3, 4, -4]} intensity={0.42} />

      <group
        scale={[
          modelPlacement.scale * preset.bodyScale[0] * silhouetteScale[0],
          modelPlacement.scale * preset.bodyScale[1] * silhouetteScale[1],
          modelPlacement.scale * preset.bodyScale[2] * silhouetteScale[2]
        ]}
        position={modelPlacement.position}
      >
        <primitive object={modelScene} />
        {targetMesh && frontVisible && (
          <Decal
            mesh={targetMesh}
            position={[0, modelPlacement.size.y * 0.56, modelPlacement.size.z * 0.18]}
            rotation={[0, 0, 0]}
            scale={[modelPlacement.size.x * 0.56, modelPlacement.size.y * 0.62, modelPlacement.size.z * 0.45]}
          >
            <meshStandardMaterial
              map={textures.front}
              transparent
              depthTest
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}
        {targetMesh && backVisible && (
          <Decal
            mesh={targetMesh}
            position={[0, modelPlacement.size.y * 0.57, -modelPlacement.size.z * 0.2]}
            rotation={[0, Math.PI, 0]}
            scale={[modelPlacement.size.x * 0.56, modelPlacement.size.y * 0.64, modelPlacement.size.z * 0.45]}
          >
            <meshStandardMaterial
              map={textures.back}
              transparent
              depthTest
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.02, 0]}>
        <circleGeometry args={[5.8, 48]} />
        <shadowMaterial opacity={0.2} />
      </mesh>

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

useGLTF.preload(MODEL_URL);
