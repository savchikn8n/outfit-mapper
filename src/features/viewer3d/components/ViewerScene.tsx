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
import { useRegionTextures } from "../hooks/useRegionTextures";

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

const isSupportedShirtMaterial = (
  material: THREE.Material
): material is
  | THREE.MeshBasicMaterial
  | THREE.MeshLambertMaterial
  | THREE.MeshPhongMaterial
  | THREE.MeshPhysicalMaterial
  | THREE.MeshStandardMaterial =>
  material instanceof THREE.MeshStandardMaterial ||
  material instanceof THREE.MeshPhysicalMaterial ||
  material instanceof THREE.MeshPhongMaterial ||
  material instanceof THREE.MeshLambertMaterial ||
  material instanceof THREE.MeshBasicMaterial;

interface ProjectedDecalProps {
  targetMesh: THREE.Mesh;
  texture: THREE.Texture;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  visible: boolean;
}

const ProjectedDecal = ({
  targetMesh,
  texture,
  position,
  rotation,
  size,
  visible
}: ProjectedDecalProps) => {
  const geometry = useMemo(() => {
    if (!visible) {
      return null;
    }

    try {
      targetMesh.updateMatrixWorld(true);
      return new DecalGeometry(
        targetMesh,
        new THREE.Vector3(...position),
        new THREE.Euler(...rotation),
        new THREE.Vector3(...size)
      );
    } catch {
      return null;
    }
  }, [position, rotation, size, targetMesh, visible]);

  useEffect(
    () => () => {
      geometry?.dispose();
    },
    [geometry]
  );

  if (!geometry || !visible) {
    return null;
  }

  return (
    <mesh geometry={geometry} renderOrder={10}>
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.02}
        side={THREE.FrontSide}
        depthTest
        depthWrite={false}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
};

export const ViewerScene = ({
  artworkLayers,
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

  const { textures, readyRevision } = useRegionTextures(artworkLayers, textureRevision);

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

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (isSupportedShirtMaterial(material) && material.map) {
          material.map.colorSpace = THREE.SRGBColorSpace;
          material.map.needsUpdate = true;
        }
      }
    });

    clone.updateMatrixWorld(true);
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
    modelScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const isShirtMesh =
        object.name === "Shirt" ||
        materials.some((material) => material.name === "ShirtMaterial");

      for (const material of materials) {
        if ("wireframe" in material) {
          material.wireframe = wireframe;
        }

        if (!isShirtMesh || !isSupportedShirtMaterial(material)) {
          material.needsUpdate = true;
          continue;
        }

        material.map = null;
        material.color.set(shirtBaseColor);
        material.side = THREE.DoubleSide;
        material.transparent = false;
        material.alphaTest = 0;
        material.needsUpdate = true;
      }
    });
  }, [modelScene, shirtBaseColor, wireframe]);

  useEffect(() => {
    const position = cameraPositions[cameraPreset];
    camera.position.set(...position);
    camera.lookAt(0, 1.5, 0);
    orbitRef.current?.target.set(0, 1.45, 0);
    orbitRef.current?.update();
  }, [camera, cameraPreset]);

  const shirtMesh = useMemo<THREE.Mesh | null>(() => {
    let found: THREE.Mesh | null = null;
    modelScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || found) {
        return;
      }

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (object.name === "Shirt" || materials.some((material) => material.name === "ShirtMaterial")) {
        found = object;
      }
    });

    return found;
  }, [modelScene]);

  const shirtBounds = useMemo(() => {
    if (!shirtMesh) {
      return null;
    }

    const resolvedShirtMesh = shirtMesh as THREE.Mesh;
    resolvedShirtMesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(resolvedShirtMesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { box, size, center };
  }, [shirtMesh]);

  const frontVisible =
    readyRevision > 0 &&
    artworkLayers.some((layer) => layer.visible && layer.targetRegion === "front");
  const backVisible =
    readyRevision > 0 &&
    artworkLayers.some((layer) => layer.visible && layer.targetRegion === "back");

  const frontDecal = useMemo(() => {
    if (!shirtBounds) {
      return null;
    }

    const width = shirtBounds.size.z * 0.52;
    const height = width * 1.45;
    return {
      position: [
        shirtBounds.box.max.x + shirtBounds.size.x * 0.018,
        shirtBounds.box.min.y + shirtBounds.size.y * 0.5,
        shirtBounds.center.z
      ] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      size: [width, height, shirtBounds.size.x * 0.16] as [number, number, number]
    };
  }, [shirtBounds]);

  const backDecal = useMemo(() => {
    if (!shirtBounds) {
      return null;
    }

    const width = shirtBounds.size.z * 0.56;
    const height = width * 1.5;
    return {
      position: [
        shirtBounds.box.min.x - shirtBounds.size.x * 0.018,
        shirtBounds.box.min.y + shirtBounds.size.y * 0.53,
        shirtBounds.center.z
      ] as [number, number, number],
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
      size: [width, height, shirtBounds.size.x * 0.16] as [number, number, number]
    };
  }, [shirtBounds]);

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
        {shirtMesh && frontDecal && (
          <ProjectedDecal
            targetMesh={shirtMesh}
            texture={textures.front}
            position={frontDecal.position}
            rotation={frontDecal.rotation}
            size={frontDecal.size}
            visible={frontVisible}
          />
        )}
        {shirtMesh && backDecal && (
          <ProjectedDecal
            targetMesh={shirtMesh}
            texture={textures.back}
            position={backDecal.position}
            rotation={backDecal.rotation}
            size={backDecal.size}
            visible={backVisible}
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
