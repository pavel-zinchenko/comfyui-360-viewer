import { app } from "../../scripts/app.js";

const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

function loadThree() {
  return new Promise((resolve) => {
    if (window.THREE) return resolve(window.THREE);
    const s = document.createElement("script");
    s.src = THREE_CDN;
    s.onload = () => resolve(window.THREE);
    document.head.appendChild(s);
  });
}

function buildViewer(container, imageUrl) {
  container.innerHTML = "";
  const THREE = window.THREE;
  const w = container.clientWidth || 400;
  const h = container.clientHeight || 300;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  container.appendChild(renderer.domElement);

  const geo = new THREE.SphereGeometry(500, 60, 40);
  geo.scale(-1, 1, 1);
  const mat = new THREE.MeshBasicMaterial();
  scene.add(new THREE.Mesh(geo, mat));

  new THREE.TextureLoader().load(imageUrl, (tex) => {
    mat.map = tex;
    mat.needsUpdate = true;
  });

  let isDragging = false, lon = 180, lat = 0, ox, oy;

  renderer.domElement.addEventListener("mousedown", (e) => {
    isDragging = true; ox = e.clientX; oy = e.clientY;
    e.stopPropagation(); e.preventDefault();
  }, true);
  window.addEventListener("mouseup", () => isDragging = false);
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    lon -= (e.clientX - ox) * 0.2;
    lat += (e.clientY - oy) * 0.2;
    lat = Math.max(-85, Math.min(85, lat));
    ox = e.clientX; oy = e.clientY;
  });
  renderer.domElement.addEventListener("wheel", (e) => {
    camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
    camera.updateProjectionMatrix();
    e.stopPropagation(); e.preventDefault();
  }, { passive: false });

  // Expose resize method on container
  container._resize360 = () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    if (nw < 10 || nh < 10) return;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  };

  (function loop() {
    requestAnimationFrame(loop);
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    camera.lookAt(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    renderer.render(scene, camera);
  })();
}

app.registerExtension({
  name: "360Viewer",

  beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "View360") return;

    const origOnNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function() {
      origOnNodeCreated?.call(this);

      this.imgs = null;
      this.onDrawBackground = function() {};

      const container = document.createElement("div");
      container.style.cssText = "width:100%;height:100%;background:#111;border-radius:4px;overflow:hidden;cursor:grab;";
      container.innerHTML = `<div style="color:#555;font:13px sans-serif;display:flex;align-items:center;justify-content:center;height:100%;">Queue the node to load 360° view</div>`;

      this.addDOMWidget("360view", "360view", container, { serialize: false });
      this.setSize([460, 420]);

      // Update renderer on node resize
      const origOnResize = this.onResize?.bind(this);
      this.onResize = function(size) {
        origOnResize?.(size);
        requestAnimationFrame(() => container._resize360?.());
      };
    };

    const origOnExecuted = nodeType.prototype.onExecuted;
    nodeType.prototype.onExecuted = async function(output) {
      origOnExecuted?.call(this, output);
      if (!output?.images?.length) return;

      const img = output.images[0];
      const url = `/view?filename=${encodeURIComponent(img.filename)}&type=${img.type}&subfolder=${encodeURIComponent(img.subfolder || "")}&t=${Date.now()}`;

      const container = this.widgets?.find(w => w.name === "360view")?.element;
      if (!container) { console.error("360Viewer: container widget not found"); return; }

      await loadThree();
      buildViewer(container, url);
    };
  },
});
