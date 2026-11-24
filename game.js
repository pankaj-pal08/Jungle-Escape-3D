import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bc4d5);
scene.fog = new THREE.Fog(0x8bc4d5, 25, 115);

const camera = new THREE.PerspectiveCamera(
    65, innerWidth / innerHeight, 0.1, 200
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.HemisphereLight(0xffffff, 0x354b25, 2));

const sun = new THREE.DirectionalLight(0xffe4b5, 2.5);
sun.position.set(-8, 15, 8);
sun.castShadow = true;
scene.add(sun);

// MATERIALS
const mat = color => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85
});

const stone = mat(0x82735e);
const roadMat = mat(0x625344);
const grass = mat(0x285b29);
const trunkMat = mat(0x57351e);
const gold = new THREE.MeshStandardMaterial({
    color: 0xffc928,
    metalness: 0.75,
    roughness: 0.2
});

// GROUND
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    mat(0x315b28)
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.4;
ground.position.z = -50;
scene.add(ground);

// ROAD
const road = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.35, 180),
    roadMat
);
road.position.set(0, -0.15, -70);
road.receiveShadow = true;
scene.add(road);

// ROAD STONE PATTERN
const roadTiles = [];

for (let z = 5; z > -170; z -= 4) {
    const tile = new THREE.Mesh(
        new THREE.BoxGeometry(7.8, 0.08, 3.8),
        mat(0x897760)
    );

    tile.position.set(0, 0.055, z);
    scene.add(tile);
    roadTiles.push(tile);
}

// ROAD SIDE RAILINGS
for (let x of [-4.15, 4.15]) {
    const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.7, 180),
        stone
    );
    rail.position.set(x, 0.25, -70);
    scene.add(rail);
}

// TEMPLE GATE
function createTemple() {
    const temple = new THREE.Group();

    const pillarMat = mat(0x80664b);

    for (let x of [-3, 3]) {
        const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 6, 0.8),
            pillarMat
        );
        pillar.position.set(x, 3, 0);
        temple.add(pillar);
    }

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.9, 1.1),
        mat(0x60432d)
    );
    top.position.y = 6.2;
    temple.add(top);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(4.5, 2.5, 4),
        mat(0x78583b)
    );
    roof.position.y = 7.7;
    temple.add(roof);

    temple.position.set(0, 0, -85);
    scene.add(temple);
}

createTemple();

// TREES
const scenery = [];

function createTree(x, z) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 3, 8),
        trunkMat
    );
    trunk.position.y = 1.5;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.7, 4, 8),
        grass
    );
    leaves.position.y = 4;
    tree.add(leaves);

    const leaves2 = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 8, 8),
        mat(0x397c30)
    );
    leaves2.position.y = 5;
    tree.add(leaves2);

    tree.position.set(x, 0, z);
    scene.add(tree);
    scenery.push(tree);
}

for (let z = 8; z > -170; z -= 9) {
    createTree(-7 - Math.random() * 3, z);
    createTree(7 + Math.random() * 3, z - 3);
}

// PLAYER - HUMANOID CHARACTER
const player = new THREE.Group();
scene.add(player);
player.position.z = 2.5;

const skin = mat(0xd99b70);
const shirt = mat(0x1764a5);
const pants = mat(0x253449);
const shoes = mat(0x28201b);
const hair = mat(0x26170e);

function box(w, h, d, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
}

// BODY
box(0.85, 1.1, 0.5, shirt, 0, 1.45, 0, player);

// NECK
box(0.23, 0.2, 0.22, skin, 0, 2.05, 0, player);

// HEAD
const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.37, 20, 20),
    skin
);
head.position.set(0, 2.4, 0);
player.add(head);

// HAIR
const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.39, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2
    ),
    hair
);
hairMesh.position.set(0, 2.53, 0);
player.add(hairMesh);

// EYES
for (let x of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        mat(0x151515)
    );
    eye.position.set(x, 2.43, 0.32);
    player.add(eye);
}

// ARMS AND LEGS - ANIMATED
const limbs = [];

function makeLimb(x, y, length, material, type) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    player.add(pivot);

    const part = box(
        type === "arm" ? 0.22 : 0.28,
        length,
        0.25,
        material,
        0, -length / 2, 0,
        pivot
    );

    if (type === "leg") {
        box(0.3, 0.2, 0.5, shoes, 0, -length + 0.02, 0.12, pivot);
    }

    limbs.push({ pivot, type });
}

makeLimb(-0.55, 1.85, 0.8, skin, "arm");
makeLimb(0.55, 1.85, 0.8, skin, "arm");
makeLimb(-0.25, 0.95, 0.9, pants, "leg");
makeLimb(0.25, 0.95, 0.9, pants, "leg");

// LANES
const lanes = [-2.4, 0, 2.4];
let lane = 1;

// GAME VARIABLES
let running = false;
let score = 0;
let coins = 0;
let speed = 19;
let jumpY = 0;
let jumpV = 0;
let slideTime = 0;
let elapsed = 0;

const objects = [];

function addObstacle(laneNo, z) {
    const obstacle = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.2, 1),
        mat(0x754226)
    );
    base.position.y = 0.6;
    base.castShadow = true;
    obstacle.add(base);

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.15, 1.1),
        mat(0x9c693b)
    );
    top.position.y = 1.25;
    obstacle.add(top);

    obstacle.position.set(lanes[laneNo], 0, z);
    scene.add(obstacle);

    objects.push({
        mesh: obstacle,
        type: "obstacle",
        lane: laneNo
    });
}

function addCoin(laneNo, z) {
    const coin = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.12, 12, 24),
        gold
    );

    coin.position.set(lanes[laneNo], 1.4, z);
    coin.rotation.y = Math.PI / 2;

    scene.add(coin);

    objects.push({
        mesh: coin,
        type: "coin",
        lane: laneNo
    });
}

function createRow(z) {
    const obstacleLane = Math.floor(Math.random() * 3);
    const coinLane = Math.floor(Math.random() * 3);

    if (Math.random() > 0.2) {
        addObstacle(obstacleLane, z);
    }

    for (let i = 0; i < 4; i++) {
        addCoin(coinLane, z - 3 - i * 1.5);
    }
}

function clearObjects() {
    for (const obj of objects) {
        scene.remove(obj.mesh);
    }
    objects.length = 0;
}

function startGame() {
    clearObjects();

    lane = 1;
    player.position.set(0, 0, 2.5);

    score = 0;
    coins = 0;
    speed = 19;
    jumpY = 0;
    jumpV = 0;
    slideTime = 0;
    elapsed = 0;

    for (let z = -15; z > -100; z -= 15) {
        createRow(z);
    }

    document.querySelector("#score").textContent = 0;
    document.querySelector("#coins").textContent = 0;

    document.querySelector("#menu").style.display = "none";
    running = true;
}

function gameOver() {
    running = false;

    document.querySelector("#menu h1").textContent = "GAME OVER";
    document.querySelector("#menu h2").textContent =
        "YOUR SCORE: " + Math.floor(score);

    document.querySelector("#menu p").textContent =
        "Coins collected: " + coins;

    document.querySelector("#startBtn").textContent = "PLAY AGAIN";
    document.querySelector("#menu").style.display = "flex";
}

document.querySelector("#startBtn").onclick = startGame;

// CONTROLS
function left() {
    if (running) lane = Math.max(0, lane - 1);
}

function right() {
    if (running) lane = Math.min(2, lane + 1);
}

function jump() {
    if (running && jumpY === 0 && slideTime <= 0) {
        jumpV = 10;
    }
}

function slide() {
    if (running && jumpY === 0) {
        slideTime = 0.8;
    }
}

addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "a") left();
    if (e.key === "ArrowRight" || e.key === "d") right();
    if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") jump();
    if (e.key === "ArrowDown" || e.key === "s") slide();
});

// MOBILE BUTTONS
document.querySelectorAll("[data-key]").forEach(btn => {
    btn.addEventListener("pointerdown", () => {
        const action = btn.dataset.key;

        if (action === "left") left();
        if (action === "right") right();
        if (action === "jump") jump();
        if (action === "slide") slide();
    });
});

// ANIMATION
const clock = new THREE.Clock();
let spawnTimer = 0;

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.04);

    if (running) {
        elapsed += dt;
        score += dt * speed;
        speed = Math.min(30, speed + dt * 0.12);

        document.querySelector("#score").textContent =
            Math.floor(score);

        document.querySelector("#coins").textContent = coins;

        // PLAYER LANE MOVEMENT
        player.position.x +=
            (lanes[lane] - player.position.x) * dt * 12;

        // RUNNING ANIMATION
        limbs.forEach((limb, i) => {
            const direction = i % 2 === 0 ? 1 : -1;

            if (jumpY === 0 && slideTime <= 0) {
                limb.pivot.rotation.x =
                    Math.sin(elapsed * 13) * 0.8 * direction;
            } else {
                limb.pivot.rotation.x = 0;
            }
        });

        // JUMP
        if (jumpV !== 0 || jumpY > 0) {
            jumpY += jumpV * dt;
            jumpV -= 25 * dt;

            if (jumpY <= 0) {
                jumpY = 0;
                jumpV = 0;
            }
        }

        if (slideTime > 0) {
            slideTime -= dt;
        }

        player.position.y = jumpY;

        player.rotation.z +=
            ((lanes[lane] - player.position.x) * -0.08 -
            player.rotation.z) * dt * 6;

        // OBSTACLES AND COINS
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];

            obj.mesh.position.z += speed * dt;

            if (obj.type === "coin") {
                obj.mesh.rotation.z += dt * 4;
            }

            const close =
                Math.abs(obj.mesh.position.z - player.position.z) < 0.8;

            const sameLane =
                Math.abs(obj.mesh.position.x - player.position.x) < 0.9;

            if (close && sameLane) {
                if (obj.type === "coin") {
                    coins++;
                    score += 10;

                    scene.remove(obj.mesh);
                    objects.splice(i, 1);
                    continue;
                }

                if (jumpY < 1.35 && slideTime <= 0) {
                    gameOver();
                    break;
                }
            }

            if (obj.mesh.position.z > 12) {
                scene.remove(obj.mesh);
                objects.splice(i, 1);
            }
        }

        // NEW ROWS
        spawnTimer += dt;

        if (spawnTimer > 1.8) {
            createRow(-105);
            spawnTimer = 0;
        }

        // MOVING ROAD PATTERN
        roadTiles.forEach(tile => {
            tile.position.z += speed * dt;

            if (tile.position.z > 8) {
                tile.position.z -= 176;
            }
        });

        // MOVING TREES
        scenery.forEach(tree => {
            tree.position.z += speed * dt;

            if (tree.position.z > 12) {
                tree.position.z -= 180;
            }
        });
    }

    // CAMERA
    camera.position.x +=
        (player.position.x * 0.2 - camera.position.x) * dt * 3;

    camera.lookAt(player.position.x * 0.15, 1.5, -8);

    renderer.render(scene, camera);
}

animate();

// RESIZE
addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});