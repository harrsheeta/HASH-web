"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Video } from "@/lib/data";
import { buildWallLayout, type CardSpec, type Cluster } from "./layout";
import { drawPolaroid, getShadowTexture, makeTapeTexture } from "./textures";

const FOV = 42;

type Pan = { x: number; y: number };

type WallProps = {
  focus: string; // "all" | section key
  selected: Video | null;
  onSelect: (v: Video | null) => void;
};

type SceneProps = WallProps & {
  panRef: MutableRefObject<Pan>;
  suppressClickRef: MutableRefObject<boolean>;
};

/* ---------------- camera ---------------- */

function fitDistance(camera: THREE.PerspectiveCamera, w: number, h: number): number {
  const vFov = (camera.fov * Math.PI) / 180;
  const zH = h / 2 / Math.tan(vFov / 2);
  const zW = w / 2 / (Math.tan(vFov / 2) * camera.aspect);
  return Math.max(zH, zW, 2.2);
}

function CameraRig({
  target,
  zoomed,
  panRef,
}: {
  target: Cluster;
  zoomed: boolean;
  panRef: MutableRefObject<Pan>;
}) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const z = fitDistance(cam, target.w * 1.12, target.h * 1.22);
    const px = zoomed ? 0 : state.pointer.x * 0.22;
    const py = zoomed ? 0 : state.pointer.y * 0.14;
    const cx = target.cx + panRef.current.x + px;
    const cy = target.cy + panRef.current.y + py;

    const d = 1 - Math.exp(-4.2 * delta);
    cam.position.x += (cx - cam.position.x) * d;
    cam.position.y += (cy - cam.position.y) * d;
    cam.position.z += (z - cam.position.z) * d;
    cam.lookAt(
      THREE.MathUtils.lerp(cam.position.x, cx, 0.92),
      THREE.MathUtils.lerp(cam.position.y, cy, 0.92),
      0,
    );
  });

  return null;
}

/* ---------------- drag panning ---------------- */

function DragControls({
  bounds,
  panRef,
  suppressClickRef,
}: {
  bounds: Cluster;
  panRef: MutableRefObject<Pan>;
  suppressClickRef: MutableRefObject<boolean>;
}) {
  const { gl, camera } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    let active = false;
    let moved = false;
    let sx = 0;
    let sy = 0;
    let px = 0;
    let py = 0;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      active = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      px = panRef.current.x;
      py = panRef.current.y;
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (!moved) return;

      const cam = camera as THREE.PerspectiveCamera;
      const vFov = (cam.fov * Math.PI) / 180;
      const worldPerPixel = (2 * cam.position.z * Math.tan(vFov / 2)) / el.clientHeight;

      const nx = px - dx * worldPerPixel;
      const ny = py + dy * worldPerPixel;
      panRef.current.x = THREE.MathUtils.clamp(nx, -bounds.w / 2, bounds.w / 2);
      panRef.current.y = THREE.MathUtils.clamp(ny, -bounds.h / 2, bounds.h / 2);
    };

    const onUp = () => {
      if (active && moved) {
        // a drag just ended — swallow the click that follows
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 120);
      }
      active = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, bounds, panRef, suppressClickRef]);

  return null;
}

/* ---------------- pinned card ---------------- */

function PinnedCard({
  spec,
  hidden,
  anySelected,
  isSelected,
  suppressClickRef,
  onSelect,
}: {
  spec: CardSpec;
  hidden: boolean;
  anySelected: boolean;
  isSelected: boolean;
  suppressClickRef: MutableRefObject<boolean>;
  onSelect: (v: Video) => void;
}) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const cardMesh = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const pinHeadMat = useRef<THREE.MeshBasicMaterial>(null);
  const pinNeedleMat = useRef<THREE.MeshBasicMaterial>(null);
  const pinGroup = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Texture lives entirely inside this effect so StrictMode's simulated
  // remount can't leave a disposed texture behind.
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    let cancelled = false;
    let loaded: HTMLImageElement | null = null;

    const paint = (img: HTMLImageElement | null) => {
      if (cancelled) return;
      drawPolaroid(canvas, spec.video, img);
      tex.needsUpdate = true;
    };

    paint(null);
    setTexture(tex);

    if (spec.video.id) {
      const img = new Image();
      img.onload = () => {
        loaded = img;
        paint(img);
      };
      img.src = `/api/thumb/${spec.video.id}`;
    }

    // repaint once webfonts arrive so captions use the real faces
    document.fonts?.ready.then(() => paint(loaded));

    return () => {
      cancelled = true;
      tex.dispose();
    };
  }, [spec.video]);

  useFrame((state, delta) => {
    if (!inner.current || !outer.current) return;
    const g = inner.current;
    const active = hovered && !anySelected && !hidden;

    let tx = 0;
    let ty = 0;
    let tz = active ? 0.22 : 0;
    let tRot = active ? spec.rot * 0.3 : spec.rot;
    let tScale = active ? 1.05 : 1;
    let lambda = 8;

    if (isSelected) {
      // picked up: fly to a "held" pose in front of the camera, shifted up
      // so the info overlay at the bottom of the frame never covers it
      const cam = state.camera as THREE.PerspectiveCamera;
      const vFov = (cam.fov * Math.PI) / 180;
      const hFovT = Math.tan(vFov / 2) * cam.aspect;
      let dist = spec.h / (2 * Math.tan(vFov / 2) * 0.5);
      dist = Math.max(dist, spec.w / (2 * hFovT * 0.82));
      const viewH = 2 * dist * Math.tan(vFov / 2);
      tx = cam.position.x - spec.x;
      ty = cam.position.y + viewH * 0.13 - spec.y;
      tz = cam.position.z - dist;
      tRot = 0;
      tScale = 1;
      lambda = 5;
    }

    const d = 1 - Math.exp(-lambda * delta);
    g.position.x += (tx - g.position.x) * d;
    g.position.y += (ty - g.position.y) * d;
    g.position.z += (tz - g.position.z) * d;
    g.rotation.z += (tRot - g.rotation.z) * d;
    g.scale.x += (tScale - g.scale.x) * d;
    g.scale.y += (tScale - g.scale.y) * d;

    if (cardMesh.current) cardMesh.current.renderOrder = isSelected ? 40 : 0;

    // card opacity
    if (matRef.current) {
      const targetOpacity = hidden ? 0 : anySelected && !isSelected ? 0.12 : 1;
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * (1 - Math.exp(-9 * delta));
    }

    // shadow stays on the board and fades when the card is lifted or hidden
    if (shadowMat.current) {
      const t = hidden || isSelected ? 0 : anySelected ? 0.2 : active ? 0.95 : 0.8;
      shadowMat.current.opacity += (t - shadowMat.current.opacity) * (1 - Math.exp(-9 * delta));
    }

    // pin pops out as the card is picked up
    if (pinGroup.current && pinHeadMat.current && pinNeedleMat.current) {
      const pulled = isSelected;
      const pz = pulled ? 0.55 : 0.09;
      pinGroup.current.position.z += (pz - pinGroup.current.position.z) * (1 - Math.exp(-12 * delta));
      const pOpacity = hidden ? 0 : pulled ? 0 : anySelected ? 0.2 : 1;
      pinHeadMat.current.opacity += (pOpacity - pinHeadMat.current.opacity) * (1 - Math.exp(-10 * delta));
      pinNeedleMat.current.opacity += (pOpacity - pinNeedleMat.current.opacity) * (1 - Math.exp(-10 * delta));
    }

    // fully faded-out cards shouldn't catch rays
    outer.current.visible = !(hidden && matRef.current !== null && matRef.current.opacity < 0.03);
  });

  return (
    <group ref={outer} position={[spec.x, spec.y, 0]}>
      {/* soft fake shadow — stays pinned to the board */}
      <mesh position={[0.09, -0.13, -0.04]} rotation={[0, 0, spec.rot]}>
        <planeGeometry args={[spec.w * 1.28, spec.h * 1.28]} />
        <meshBasicMaterial ref={shadowMat} map={getShadowTexture()} transparent depthWrite={false} opacity={0.8} />
      </mesh>

      {/* polaroid */}
      <group ref={inner} rotation={[0, 0, spec.rot]}>
        <mesh
          ref={cardMesh}
          onClick={(e) => {
            e.stopPropagation();
            if (hidden || suppressClickRef.current) return;
            onSelect(spec.video);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (!hidden) setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[spec.w, spec.h]} />
          {texture ? (
            <meshBasicMaterial key="textured" ref={matRef} map={texture} transparent toneMapped={false} />
          ) : (
            <meshBasicMaterial key="flat" ref={matRef} color="#f7f3e8" transparent toneMapped={false} />
          )}
        </mesh>
      </group>

      {/* push pin — stays in the board, pops out when the card is taken */}
      <group ref={pinGroup} position={[0, spec.h / 2 - 0.09, 0.09]}>
        <mesh>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshBasicMaterial ref={pinHeadMat} color={spec.pinColor} transparent toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.035, -0.03]} rotation={[Math.PI / 2.4, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.1, 8]} />
          <meshBasicMaterial ref={pinNeedleMat} color="#a8925f" transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------- tape section label ---------------- */

function TapeLabel({
  text,
  x,
  y,
  tilt,
  dimTarget,
}: {
  text: string;
  x: number;
  y: number;
  tilt: number;
  dimTarget: number;
}) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    let current = makeTapeTexture(text);
    let cancelled = false;
    setTexture(current);
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      current.dispose();
      current = makeTapeTexture(text);
      setTexture(current);
    });
    return () => {
      cancelled = true;
      current.dispose();
    };
  }, [text]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    mat.current.opacity += (dimTarget - mat.current.opacity) * (1 - Math.exp(-9 * delta));
  });

  if (!texture) return null;
  return (
    <mesh position={[x, y, 0.05]} rotation={[0, 0, tilt]}>
      <planeGeometry args={[2.9, 0.5]} />
      <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

/* ---------------- scene ---------------- */

function WallScene({ focus, selected, onSelect, panRef, suppressClickRef }: SceneProps) {
  const layout = useMemo(() => buildWallLayout(), []);
  const boardRef = useRef<THREE.Group>(null);

  useEffect(() => {
    panRef.current = { x: 0, y: 0 };
  }, [focus, panRef]);

  const target: Cluster =
    focus === "all"
      ? layout.overview
      : { ...layout.clusters[focus], w: layout.clusters[focus].w + 0.8, h: layout.clusters[focus].h + 1.9 };

  useFrame((state, delta) => {
    if (!boardRef.current) return;
    const d = 1 - Math.exp(-3 * delta);
    const rx = selected ? 0 : -state.pointer.y * 0.04;
    const ry = selected ? 0 : state.pointer.x * 0.06;
    boardRef.current.rotation.x += (rx - boardRef.current.rotation.x) * d;
    boardRef.current.rotation.y += (ry - boardRef.current.rotation.y) * d;
  });

  return (
    <>
      <CameraRig target={target} zoomed={!!selected} panRef={panRef} />
      <DragControls bounds={layout.overview} panRef={panRef} suppressClickRef={suppressClickRef} />
      <group ref={boardRef}>
        {layout.sections.map((s) => {
          const cluster = layout.clusters[s.key];
          const dim = selected ? 0.12 : focus !== "all" && focus !== s.key ? 0 : 1;
          return (
            <TapeLabel
              key={s.key}
              text={`${s.timecode} / ${s.label}`}
              x={cluster.cx}
              y={cluster.cy + cluster.h / 2 + 0.62}
              tilt={s.key === "short" ? -0.035 : 0.03}
              dimTarget={dim}
            />
          );
        })}
        {layout.cards.map((spec) => (
          <PinnedCard
            key={spec.video.url}
            spec={spec}
            hidden={focus !== "all" && spec.sectionKey !== focus}
            anySelected={!!selected}
            isSelected={selected?.url === spec.video.url}
            suppressClickRef={suppressClickRef}
            onSelect={onSelect}
          />
        ))}
      </group>
    </>
  );
}

export default function EditWall(props: WallProps) {
  const panRef = useRef<Pan>({ x: 0, y: 0 });
  const suppressClickRef = useRef(false);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: FOV, position: [0, 0, 9], near: 0.1, far: 100 }}
      onPointerMissed={() => {
        if (!suppressClickRef.current) props.onSelect(null);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <WallScene {...props} panRef={panRef} suppressClickRef={suppressClickRef} />
    </Canvas>
  );
}
