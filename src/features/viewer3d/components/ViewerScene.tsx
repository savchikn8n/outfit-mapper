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
import { useTextureComposer } from "../../layout2d/hooks/useTextureComposer";

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
  front: [0, 1.3, 4.6],
  back: [0, 1.3, -4.6],
  left: [4.6, 1.3, 0],
  right: [-4.6, 1.3, 0],
  perspective: [3.8, 1.9, 3.8]
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
        ? [0.96, 1, 0.96] as [number, number, number]
        : [1, 1.02, 1] as [number, number, number],
    [avatarGender]
  );

  const { textureCanvas, textureReadyRevision } = useTextureComposer(
    artworkLayers,
    shirtBaseColor,
    textureRevision
  );

  const shirtTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    return texture;
  }, [textureCanvas]);

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
    const scale = 3 / maxSize;

    return {
      scale,
      box,
      center,
      size,
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
    shirtTexture.needsUpdate = true;
  }, [shirtTexture, textureReadyRevision]);

  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [backgroundColor, scene]);

  useEffect(() => {
    modelScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if ("wireframe" in material) {
          material.wireframe = wireframe;
        }

        if (!isSupportedShirtMaterial(material)) {
          material.needsUpdate = true;
          continue;
        }

        material.map = shirtTexture;
        material.color.set("#ffffff");
        material.side = THREE.DoubleSide;
        material.transparent = false;
        material.alphaTest = 0;
        if ("normalMap" in material) {
          material.normalMap = null;
        }
        if ("aoMap" in material) {
          material.aoMap = null;
        }
        if ("roughnessMap" in material) {
          material.roughnessMap = null;
        }
        if ("metalnessMap" in material) {
          material.metalnessMap = null;
        }
        if ("alphaMap" in material) {
          material.alphaMap = null;
        }
        if ("roughness" in material) {
          material.roughness = 1;
        }
        if ("metalness" in material) {
          material.metalness = 0;
        }
        material.needsUpdate = true;
      }
    });
  }, [modelScene, shirtTexture, textureReadyRevision, wireframe]);

  useEffect(() => {
    const position = cameraPositions[cameraPreset];
    camera.position.set(...position);
    camera.lookAt(0, modelPlacement.size.y * 0.46, 0);
    orbitRef.current?.target.set(0, modelPlacement.size.y * 0.46, 0);
    orbitRef.current?.update();
  }, [camera, cameraPreset, modelPlacement.size.y]);

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 3]} intensity={1.15} castShadow />
      <directionalLight position={[-3, 4, -4]} intensity={0.4} />

      <group
        scale={[
          modelPlacement.scale * preset.bodyScale[0] * silhouetteScale[0],
          modelPlacement.scale * preset.bodyScale[1] * silhouetteScale[1],
          modelPlacement.scale * preset.bodyScale[2] * silhouetteScale[2]
        ]}
        position={modelPlacement.position}
      >
        <primitive object={modelScene} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.02, 0]}>
        <circleGeometry args={[5.8, 48]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      <OrbitControls
        ref={orbitRef}
        enableDamping
        minDistance={1.8}
        maxDistance={8}
        maxPolarAngle={Math.PI / 1.55}
      />
    </>
  );
};

useGLTF.preload(MODEL_URL);
