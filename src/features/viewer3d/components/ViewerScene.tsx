import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { avatarPresets } from "../../avatar/presets";
import {
  ArtworkLayer,
  AvatarGender,
  CameraPreset,
  MannequinPresetId
} from "../../../types/app";
import { MODEL_URL } from "../modelHackConfig";
import { useDecalTextures } from "../hooks/useDecalTextures";
import { layoutRegions } from "../../layout2d/layoutRegions";

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
  front: [5, 1.8, 0],
  back: [-5, 1.8, 0],
  left: [0, 1.8, 5],
  right: [0, 1.8, -5],
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
      box,
      size,
      center,
      position: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [
        number,
        number,
        number
      ]
    };
  }, [modelScene]);

  const targetMesh = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    modelScene.traverse((object) => {
      if (!mesh && object instanceof THREE.Mesh) {
        mesh = object;
      }
    });
    return mesh;
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

  const frontVisible =
    readyRevision > 0 &&
    artworkLayers.some((layer) => layer.visible && layer.targetRegion === "front");
  const backVisible =
    readyRevision > 0 &&
    artworkLayers.some((layer) => layer.visible && layer.targetRegion === "back");

  const frontRegion = layoutRegions.find((region) => region.id === "front") ?? layoutRegions[0];
  const overlayAspect = frontRegion.height / frontRegion.width;
  const frontScale: [number, number, number] = [
    modelPlacement.size.z * 0.92 * preset.shirtScale[0],
    modelPlacement.size.z * 0.92 * overlayAspect * preset.shirtScale[1],
    Math.max(modelPlacement.size.x * 0.4, 0.28)
  ];
  const backScale: [number, number, number] = [
    modelPlacement.size.z * 0.8 * preset.shirtScale[0],
    modelPlacement.size.z * 0.8 * overlayAspect * preset.shirtScale[1],
    Math.max(modelPlacement.size.x * 0.32, 0.24)
  ];
  const overlayZ = modelPlacement.center.z;
  const frontOverlayY = modelPlacement.box.min.y + modelPlacement.size.y * 0.53;
  const backOverlayY = modelPlacement.box.min.y + modelPlacement.size.y * 0.54;
  const frontOverlayX = modelPlacement.box.max.x + frontScale[2] * 0.34;
  const backOverlayX = modelPlacement.box.min.x - backScale[2] * 0.34;

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
          <ProjectedDecal
            mesh={targetMesh}
            texture={textures.front}
            position={[frontOverlayX, frontOverlayY, overlayZ]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={frontScale}
          />
        )}
        {targetMesh && backVisible && (
          <ProjectedDecal
            mesh={targetMesh}
            texture={textures.back}
            position={[backOverlayX, backOverlayY, overlayZ]}
            rotation={[0, Math.PI / 2, 0]}
            scale={backScale}
          />
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

interface ProjectedDecalProps {
  mesh: THREE.Mesh;
  texture: THREE.Texture;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const ProjectedDecal = ({
  mesh,
  texture,
  position,
  rotation,
  scale
}: ProjectedDecalProps) => {
  const geometry = useMemo(() => {
    try {
      return new DecalGeometry(
        mesh,
        new THREE.Vector3(...position),
        new THREE.Euler(...rotation),
        new THREE.Vector3(...scale)
      );
    } catch (error) {
      console.error("Decal projection failed", error);
      return null;
    }
  }, [mesh, position, rotation, scale]);

  useEffect(
    () => () => {
      geometry?.dispose();
    },
    [geometry]
  );

  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry} renderOrder={10}>
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthTest
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
};
