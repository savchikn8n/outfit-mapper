import { useEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
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

const decalConfig = {
  front: {
    width: 0.42,
    xOffset: 0.008,
    yOffset: 0.5,
    zOffset: 0,
    curve: 0.024
  },
  back: {
    width: 0.46,
    xOffset: 0.01,
    yOffset: 0.52,
    zOffset: 0,
    curve: 0.02
  }
} as const;

const createCurvedOverlayGeometry = (
  width: number,
  height: number,
  curveDepth: number
) => {
  const geometry = new THREE.PlaneGeometry(width, height, 40, 24);
  const position = geometry.attributes.position;
  const halfWidth = width / 2;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const normalized = halfWidth === 0 ? 0 : x / halfWidth;
    const bow = Math.cos(normalized * (Math.PI / 2)) * curveDepth;
    position.setZ(index, bow);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
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
  const frontWidth = modelPlacement.size.z * decalConfig.front.width * preset.shirtScale[0];
  const frontHeight = frontWidth * overlayAspect;
  const backWidth = modelPlacement.size.z * decalConfig.back.width * preset.shirtScale[0];
  const backHeight = backWidth * overlayAspect;
  const frontOverlayZ = modelPlacement.center.z + modelPlacement.size.z * decalConfig.front.zOffset;
  const backOverlayZ = modelPlacement.center.z + modelPlacement.size.z * decalConfig.back.zOffset;
  const frontOverlayY =
    modelPlacement.box.min.y + modelPlacement.size.y * decalConfig.front.yOffset;
  const backOverlayY =
    modelPlacement.box.min.y + modelPlacement.size.y * decalConfig.back.yOffset;
  const frontOverlayX =
    modelPlacement.box.max.x + modelPlacement.size.x * decalConfig.front.xOffset;
  const backOverlayX =
    modelPlacement.box.min.x - modelPlacement.size.x * decalConfig.back.xOffset;

  const frontGeometry = useMemo(
    () =>
      createCurvedOverlayGeometry(
        frontWidth,
        frontHeight,
        modelPlacement.size.x * decalConfig.front.curve
      ),
    [frontHeight, frontWidth, modelPlacement.size.x]
  );
  const backGeometry = useMemo(
    () =>
      createCurvedOverlayGeometry(
        backWidth,
        backHeight,
        modelPlacement.size.x * decalConfig.back.curve
      ),
    [backHeight, backWidth, modelPlacement.size.x]
  );

  useEffect(
    () => () => {
      frontGeometry.dispose();
      backGeometry.dispose();
    },
    [backGeometry, frontGeometry]
  );

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
        {frontVisible && (
          <mesh
            geometry={frontGeometry}
            position={[frontOverlayX, frontOverlayY, frontOverlayZ]}
            rotation={[0, Math.PI / 2, 0]}
            renderOrder={10}
          >
            <meshBasicMaterial
              map={textures.front}
              transparent
              alphaTest={0.01}
              side={THREE.FrontSide}
              depthTest
              depthWrite={false}
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-4}
            />
          </mesh>
        )}
        {backVisible && (
          <mesh
            geometry={backGeometry}
            position={[backOverlayX, backOverlayY, backOverlayZ]}
            rotation={[0, -Math.PI / 2, 0]}
            renderOrder={10}
          >
            <meshBasicMaterial
              map={textures.back}
              transparent
              alphaTest={0.01}
              side={THREE.FrontSide}
              depthTest
              depthWrite={false}
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-4}
            />
          </mesh>
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
