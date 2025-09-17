import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#97B7B2");
scene.fog = new THREE.Fog(scene.background, 1, 20);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const appCanvas = document.getElementById("appCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas: appCanvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const light = new THREE.HemisphereLight("white", "#53F468");
scene.add(light);

function resize() {
  let width = document.body.clientWidth;
  let height = document.body.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
window.addEventListener("resize", resize);

let cells = [];
const widthNum = 14;
const heightNum = 10;
let points = [];
function generateCells(width, height) {
  for (let i = 0; i < width; i++) {
    cells[i] = [];
    for (let j = 0; j < height; j++) {
      if (Math.random() > 0.6) {
        cells[i][j] = {
          aliveNow: true,
          aliveNext: false,
          liveNeighbours: 0,
        };
      } else {
        cells[i][j] = {
          aliveNow: false,
          aliveNext: false,
          liveNeighbours: 0,
        };
      }

      if (
        (i == 0 && j == 0) ||
        (i === width - 1 && j === height - 1) ||
        (i === 0 && j === height - 1) ||
        (i === width - 1 && j === 0)
      ) {
        cells[i][j] = {
          aliveNow: true,
          aliveNext: false,
          liveNeighbours: 0,
        };
      } else {
        cells[i][j] = {
          aliveNow: false,
          aliveNext: false,
          liveNeighbours: 0,
        };
      }
    }
  }
}

function cellIsAliveNextGeneration() {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      cells[i][j].liveNeighbours = 0;

      if (typeof cells[i - 1] != "undefined" && cells[i - 1][j].aliveNow) {
        cells[i][j].liveNeighbours++;
      }
      if (typeof cells[i + 1] != "undefined" && cells[i + 1][j].aliveNow) {
        cells[i][j].liveNeighbours++;
      }
      if (typeof cells[i][j - 1] != "undefined" && cells[i][j - 1].aliveNow) {
        cells[i][j].liveNeighbours++;
      }
      if (typeof cells[i][j + 1] != "undefined" && cells[i][j + 1].aliveNow) {
        cells[i][j].liveNeighbours++;
      }

      if (
        cells[i][j].liveNeighbours === 0 ||
        cells[i][j].liveNeighbours === 2
      ) {
        cells[i][j].aliveNext = false;
      } else {
        cells[i][j].aliveNext = true;
      }
    }
  }
}

function resetGeneration() {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      cells[i][j].aliveNow = cells[i][j].aliveNext;
    }
  }
}

function getPointsCoords(generationNumber) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      if (cells[i][j].aliveNow) {
        points.push({
          x: i,
          y: generationNumber,
          z: j,
        });
      }
    }
  }
}

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: "#7D8A17" });

function createCubes() {
  const cubeInstances = new THREE.InstancedMesh(
    geometry,
    material,
    points.length,
  );
  scene.add(cubeInstances);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < points.length; i++) {
    dummy.position.x = points[i].x;
    dummy.position.y = points[i].y;
    dummy.position.z = points[i].z;

    dummy.updateMatrix();
    cubeInstances.setMatrixAt(i, dummy.matrix);
  }
}

generateCells(widthNum, heightNum);

for (let i = 0; i < 20; i++) {
  cellIsAliveNextGeneration();
  getPointsCoords(i);
  resetGeneration();
}

createCubes();

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(widthNum / 2, 10, heightNum * 1.5);
controls.target = new THREE.Vector3(widthNum / 2, 3, heightNum / 2);
controls.maxDistance = 20;
controls.update();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
