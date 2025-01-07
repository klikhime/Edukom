import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import WebXRPolyfill from "webxr-polyfill";
import { BoxLineGeometry } from "three/addons/geometries/BoxLineGeometry.js";

// WebXR Polyfill Setup
const polyfill = new WebXRPolyfill();

// DOM Elements
const startBtn = document.getElementById("start-btn");
const helpBtn = document.getElementById("help-btn");
// const vrBtn = document.getElementById("VRButton");
const loadingBox = document.getElementById("loading");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const popup = document.getElementById("popup");
const closeButton = document.getElementById("close-btn");

startBtn.addEventListener("click", () => {
  document.getElementById("boxWelcome").style.display = "none";

  // Enable VR button
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));
  initThreeJS();
});

helpBtn.addEventListener("click", () => {
  document.getElementById("welcome").innerHTML = "Bantuan";
  helpBtn.style.display = "none";
  document.getElementById("desk-app").innerHTML =
    "Klik pada komponen untuk mengeksplorasi dan mendapatkan informasi lengkap tentang komponen tersebut.";
});

// vrBtn.addEventListener("click", () => {
//   console.log("click");
// });

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1b1b1b);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);

// Pengaturan Scene dan Lingkungan
const scene = new THREE.Scene();

// Membuat lingkungan gelap (opsional: RoomEnvironment dapat diganti dengan lingkungan kustom jika diperlukan)
const environment = new RoomEnvironment();

// Menggunakan PMREMGenerator untuk pantulan lingkungan
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(environment).texture;

scene.background = new THREE.Color(0x1b1b1b);
// scene.background = scene.environment;

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(4, 5, 11);

// Room Setup
// const room = new THREE.LineSegments(
//   new BoxLineGeometry(40, 14, 40, 10, 10, 10).translate(0, 6, 0), // Perbesar ukuran box dan subdivisi
//   new THREE.LineBasicMaterial({ color: 0xbcbcbc })
// );
// scene.add(room);

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Background Color
scene.background = new THREE.Color(0x333333); // Sesuaikan dengan warna ground

// Lighting Setup
const spotLight = new THREE.SpotLight(0xffffff, 2000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Warna lebih gelap agar lebih menyatu
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 10, 10).normalize();
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground Plane Setup
const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

// Update ground material
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333, // Sesuaikan warna dengan latar belakang
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.position.set(0, -0.3, 0);
groundMesh.receiveShadow = true;

scene.add(groundMesh);

let model;
// GLTF Model Loading
const loader = new GLTFLoader().setPath("public/models/");
loader.load(
  "scene.gltf",
  (gltf) => {
    console.log("Model Loaded");
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    model.position.set(0, 0, 0);
    scene.add(model);
    progressContainer.style.zIndex = "none";
    loadingBox.style.display = "none";
  },
  (xhr) => {
    const progress = (xhr.loaded / xhr.total) * 100;
    progressBar.style.width = `${progress}%`;
    console.log(`Loading: ${progress}%`);
  },
  (error) => {
    console.error(error);
  }
);

// Resize Handling
window.addEventListener("resize", onWindowResize);

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const objectData = {
  MaterialFBXASC032FBXASC0354_1: {
    name: "Monitor",
    description:
      "Monitor adalah layar komputer yang menampilkan semua hal yang sedang kita kerjakan di komputer, seperti tulisan, gambar, video, atau game. Ibaratnya, monitor adalah jendela utama untuk melihat dan mengontrol apa yang terjadi di dalam komputer.",
    additionalInfo:
      "Komputer mengirim sinyal ke monitor yang mengubahnya menjadi gambar yang dapat dilihat. Monitor yang lebih canggih menampilkan gambar yang lebih jelas dan tajam.",
  },
  MaterialFBXASC032FBXASC0352_1: {
    name: "Printer",
    description:
      "Printer adalah perangkat elektronik yang digunakan untuk mencetak dokumen, gambar, atau foto dari komputer atau perangkat lainnya ke media fisik seperti kertas. Ibaratnya, printer adalah 'pengubah' dari sesuatu yang digital menjadi sesuatu yang bisa kita pegang dan lihat langsung.",
    additionalInfo:
      "Printer menerima data dari komputer dan mencetaknya. Ada printer hitam-putih dan berwarna, tergantung modelnya.",
  },
  MaterialFBXASC032FBXASC0354_ncl1_1_5: {
    name: "CPU",
    description:
      "CPU (Central Processing Unit) adalah otak dari komputer atau perangkat elektronik. Ia bertanggung jawab untuk menjalankan perintah-perintah dari program dan mengolah semua data yang ada di dalam sistem. Semua perhitungan dan keputusan yang dibuat oleh komputer diproses oleh CPU.",
    additionalInfo:
      "CPU menerima perintah dari program, memprosesnya, dan kemudian mengirimkan hasilnya kembali ke perangkat lainnya (misalnya monitor atau printer). Proses ini sangat cepat, dan CPU melakukan jutaan operasi per detik.",
  },
  MaterialFBXASC032FBXASC0354_ncl1_1_3: {
    name: "Keyboard",
    description:
      "Keyboard adalah perangkat input utama yang digunakan untuk memasukkan data ke dalam komputer atau perangkat elektronik lainnya. Ibaratnya, keyboard adalah 'pintu' untuk berkomunikasi dengan komputer, karena kita memberikan perintah atau mengetik teks melalui tombol-tombolnya.",
    additionalInfo:
      "Anda menekan tombol untuk mengetik teks atau memberikan perintah ke komputer.",
  },
  MaterialFBXASC032FBXASC0354_ncl1_1_1: {
    name: "Mouse",
    description:
      "Mouse adalah perangkat input komputer yang digunakan untuk menggerakkan kursor di layar dan memilih atau mengklik objek di dalam sistem komputer. Ibaratnya, mouse adalah penunjuk di dunia digital, membantu kita berinteraksi secara visual dengan apa yang ada di layar.",
    additionalInfo:
      "Anda menggerakkan mouse untuk menggerakkan kursor dan mengklik objek di layar.",
  },
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function initThreeJS() {
  document.addEventListener("mousedown", onMouseDown);
  animate();
}

function onMouseDown(event) {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;
    const objectName = selectedObject.name;
    if (objectData[objectName]) {
      const data = objectData[objectName];
      //   selectedObject.material.color.set(0xffffff);
      showPopup(data);
    }
    // Loop untuk menampilkan detail objek yang terdeteksi
    // intersections.forEach((intersection, index) => {
    //     const selectedObject = intersection.object; // Objek yang terdeteksi
    //     console.log(`Objek ${index + 1}:`);
    //     console.log(`Nama objek: ${selectedObject.name}`);
    //     console.log(`Posisi: ${selectedObject.position}`);
    //     console.log(`Material warna: ${selectedObject.material.color.getHexString()}`);

    //     // Jika objek memiliki data tambahan, tampilkan juga
    //     if (objectData[selectedObject.name]) {
    //       console.log(`Data objek: `, objectData[selectedObject.name]);
    //     }
    //   });
  }
}

function showPopup(data) {
  document.getElementById("object-tittle").innerText = data.name;
  document.getElementById("object-name").innerText = data.name;
  document.getElementById("object-description").innerText = data.description;
  document.getElementById("object-additional-info").innerText =
    data.additionalInfo;
  popup.classList.add("show");
}

closeButton.addEventListener("click", () => {
  popup.classList.remove("show");
});

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.005; // Rotasi model secara perlahan pada sumbu Y
  }
  controls.update();
  renderer.render(scene, camera);
}
