/**
 * Flores Amarillas para Yami 💛 con Kuromi
 * Three.js 3D Interactive Scene
 */

// Global State
let scene, camera, renderer, controls;
let kuromiGroup, bouquetGroup, textCloudGroup, starsGroup, petalsGroup, ripples = [];
let clock = new THREE.Clock();
let isAutoRotating = true;

// Texture Loader
const textureLoader = new THREE.TextureLoader();

// Romantic Phrases to orbit around the bouquet (from the video inspiration)
const ROMANTIC_PHRASES = [
    { text: "Te Amo 💖", color: "#ff74b1" },
    { text: "Eres mi sol ☀️", color: "#facc15" },
    { text: "Mi persona favorita ✨", color: "#67e8f9" },
    { text: "Siempre juntos 💑", color: "#f472b6" },
    { text: "Es un sueño 💫", color: "#c084fc" },
    { text: "Para siempre 🌟", color: "#fde047" },
    { text: "Te adoro 💕", color: "#fb7185" },
    { text: "Mi corazón 💖", color: "#f43f5e" },
    { text: "Mi niña hermosa 🌻", color: "#facc15" },
    { text: "Te las mereces 💛", color: "#fde047" }
];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initScene();
    initLights();
    initEnvironment();
    initPlatform();
    initKuromi();
    initBouquet();
    initFloatingTexts();
    initFloatingPetals();
    initEventListeners();
    animate();
});

/* ==========================================================================
   1. SCENE SETUP
   ========================================================================== */
function initScene() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06030d); // Deep cosmic night
    scene.fog = new THREE.FogExp2(0x06030d, 0.022);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3.4, 13.0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding; // Ensures accurate vibrant color reproduction
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath floor
    controls.minDistance = 3.5;
    controls.maxDistance = 24;
    controls.target.set(0, 2.2, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Pause auto-rotate when user manually interacts
    controls.addEventListener('start', () => {
        isAutoRotating = false;
        controls.autoRotate = false;
        const btn = document.getElementById('btnAutoRotate');
        if (btn) btn.classList.remove('active');
    });
}

/* ==========================================================================
   2. LIGHTING
   ========================================================================== */
function initLights() {
    // Ambient moonlit glow
    const ambientLight = new THREE.AmbientLight(0x351d5c, 1.4);
    scene.add(ambientLight);

    // Main soft directional light from above-front
    const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Warm golden glow emanating from inside the bouquet
    const bouquetLight = new THREE.PointLight(0xffd166, 3.5, 12, 1.2);
    bouquetLight.position.set(2.4, 3.2, 0.8);
    scene.add(bouquetLight);

    // Vibrant neon pink/purple light on Kuromi
    const kuromiPinkLight = new THREE.PointLight(0xff74b1, 3.2, 10, 1.2);
    kuromiPinkLight.position.set(-2.8, 2.5, 1.4);
    scene.add(kuromiPinkLight);

    const kuromiRimLight = new THREE.PointLight(0xa855f7, 2.6, 9, 1.4);
    kuromiRimLight.position.set(-2.8, 3.8, -1.8);
    scene.add(kuromiRimLight);
}

/* ==========================================================================
   3. ENVIRONMENT (Twinkling Stars & Nebula)
   ========================================================================== */
function initEnvironment() {
    starsGroup = new THREE.Group();

    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xfacc15), // golden star
        new THREE.Color(0xff74b1), // pink star
        new THREE.Color(0x38bdf8), // cyan star
        new THREE.Color(0xc084fc)  // lavender star
    ];

    for (let i = 0; i < starCount; i++) {
        const radius = 35 + Math.random() * 55;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 1.8 - 0.9);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = Math.max(0.5, radius * Math.sin(phi) * Math.sin(theta));
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const starCol = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = starCol.r;
        colors[i * 3 + 1] = starCol.g;
        colors[i * 3 + 2] = starCol.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Star glow texture
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 64;
    starCanvas.height = 64;
    const sCtx = starCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMaterial = new THREE.PointsMaterial({
        size: 0.38,
        map: starTexture,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    starsGroup.add(starPoints);
    scene.add(starsGroup);
}

/* ==========================================================================
   4. PLATFORM & NEON RINGS
   ========================================================================== */
function initPlatform() {
    const platformGroup = new THREE.Group();

    // Dark reflective ground plane
    const groundGeo = new THREE.CircleGeometry(18, 64);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x080414,
        roughness: 0.22,
        metalness: 0.88
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    platformGroup.add(ground);

    // Glowing Neon Rings
    function createGlowRing(radius, thickness, colorHex, opacity = 0.85) {
        const ringGeo = new THREE.RingGeometry(radius - thickness, radius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        return ring;
    }

    // Outer stage rings
    platformGroup.add(createGlowRing(6.5, 0.08, 0x8b5cf6, 0.45));
    platformGroup.add(createGlowRing(5.2, 0.06, 0x38bdf8, 0.55));

    // Kuromi podium rings (Left: x = -2.8)
    const kuromiPodium = new THREE.Group();
    kuromiPodium.position.set(-2.8, 0, 0);
    kuromiPodium.add(createGlowRing(2.1, 0.12, 0xff74b1, 0.9));
    kuromiPodium.add(createGlowRing(1.6, 0.07, 0x38bdf8, 0.8));
    kuromiPodium.add(createGlowRing(1.1, 0.05, 0xc084fc, 0.65));
    
    // Filled inner soft glow disc for Kuromi
    const discGeo = new THREE.CircleGeometry(1.58, 48);
    const discMat = new THREE.MeshBasicMaterial({
        color: 0x240e3f,
        transparent: true,
        opacity: 0.7
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.01;
    kuromiPodium.add(disc);

    platformGroup.add(kuromiPodium);

    // Sunflower bouquet podium rings (Right: x = 2.4)
    const bouquetPodium = new THREE.Group();
    bouquetPodium.position.set(2.4, 0, 0);
    bouquetPodium.add(createGlowRing(1.9, 0.11, 0xfacc15, 0.85));
    bouquetPodium.add(createGlowRing(1.4, 0.07, 0xf59e0b, 0.7));
    platformGroup.add(bouquetPodium);

    scene.add(platformGroup);

    // Animated ripple rings on ground
    for (let r = 0; r < 2; r++) {
        const rip = createGlowRing(1.0, 0.04, 0xff74b1, 0.5);
        rip.position.set(-2.8, 0.015, 0);
        rip.userData = { scaleSpeed: 0.015 + r * 0.008, phase: r * Math.PI };
        ripples.push(rip);
        scene.add(rip);
    }
}

// References for 3D Kuromi animation
let kuromi3DGroup, kuromiRightArm, kuromiTail, kuromiHead;

/* ==========================================================================
   5. KUROMI CHARACTER (3D Procedural Chibi Model)
   ========================================================================== */
function initKuromi() {
    kuromiGroup = new THREE.Group();
    kuromiGroup.position.set(-2.8, 0, 0);

    kuromi3DGroup = new THREE.Group();
    // Tilted slightly toward the front-right to face viewer and flowers
    kuromi3DGroup.rotation.y = 0.25;

    // Materials
    // Deep pure jet-black without shiny light reflections
    const blackMat = new THREE.MeshBasicMaterial({
        color: 0x08060b
    });

    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.05
    });

    const pinkMat = new THREE.MeshStandardMaterial({
        color: 0xff74b1,
        roughness: 0.35,
        metalness: 0.08
    });

    const darkMat = new THREE.MeshBasicMaterial({ color: 0x08060c });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff9ec7, transparent: true, opacity: 0.65 });

    // 1. LEGS & FEET
    const legGeo = new THREE.CylinderGeometry(0.24, 0.30, 0.65, 24);
    const footGeo = new THREE.SphereGeometry(0.32, 24, 24);

    // Left leg & foot
    const leftLeg = new THREE.Mesh(legGeo, whiteMat);
    leftLeg.position.set(-0.38, 0.42, 0);
    kuromi3DGroup.add(leftLeg);

    const leftFoot = new THREE.Mesh(footGeo, whiteMat);
    leftFoot.scale.set(1.0, 0.6, 1.3);
    leftFoot.position.set(-0.38, 0.18, 0.12);
    kuromi3DGroup.add(leftFoot);

    // Right leg & foot
    const rightLeg = new THREE.Mesh(legGeo, whiteMat);
    rightLeg.position.set(0.38, 0.42, 0);
    kuromi3DGroup.add(rightLeg);

    const rightFoot = new THREE.Mesh(footGeo, whiteMat);
    rightFoot.scale.set(1.0, 0.6, 1.3);
    rightFoot.position.set(0.38, 0.18, 0.12);
    kuromi3DGroup.add(rightFoot);

    // 2. TORSO (Chubby white pear body)
    const torsoGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const torso = new THREE.Mesh(torsoGeo, whiteMat);
    torso.scale.set(0.96, 1.15, 0.9);
    torso.position.set(0, 1.15, 0);
    torso.castShadow = true;
    kuromi3DGroup.add(torso);

    // 3. ARMS (Both arms clearly visible, cute and expressive)
    const armGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.65, 20);
    const handGeo = new THREE.SphereGeometry(0.20, 20, 20);

    // Left Arm (Viewer's left: resting comfortably on her hip/side)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.78, 1.25, 0.12);
    leftArmGroup.rotation.z = -0.45;
    leftArmGroup.rotation.x = 0.25;

    const armMeshL = new THREE.Mesh(armGeo, whiteMat);
    armMeshL.position.y = -0.28;
    leftArmGroup.add(armMeshL);

    const handMeshL = new THREE.Mesh(handGeo, whiteMat);
    handMeshL.position.y = -0.62;
    leftArmGroup.add(handMeshL);
    kuromi3DGroup.add(leftArmGroup);

    // Right Arm (Viewer's right: raised waving hello cheerfully to the camera!)
    kuromiRightArm = new THREE.Group();
    kuromiRightArm.position.set(0.80, 1.25, 0.15);
    kuromiRightArm.rotation.z = -0.75;
    kuromiRightArm.rotation.x = 0.35;

    const armMeshR = new THREE.Mesh(armGeo, whiteMat);
    armMeshR.position.y = 0.28;
    kuromiRightArm.add(armMeshR);

    const handMeshR = new THREE.Mesh(handGeo, whiteMat);
    handMeshR.position.y = 0.62;
    kuromiRightArm.add(handMeshR);
    kuromi3DGroup.add(kuromiRightArm);

    // 4. JESTER NECK COLLAR (Black points with pink balls)
    const collarGroup = new THREE.Group();
    collarGroup.position.set(0, 1.76, 0);
    const collarPoints = 6;
    const conePointGeo = new THREE.ConeGeometry(0.20, 0.48, 4);
    const pinkBallGeo = new THREE.SphereGeometry(0.11, 16, 16);

    for (let i = 0; i < collarPoints; i++) {
        const angle = i * (Math.PI * 2 / collarPoints) + Math.PI / 6;
        const cp = new THREE.Group();
        cp.position.set(Math.cos(angle) * 0.62, 0, Math.sin(angle) * 0.62);
        cp.rotation.y = -angle + Math.PI / 2;
        cp.rotation.z = -Math.PI / 3;

        const coneP = new THREE.Mesh(conePointGeo, blackMat);
        coneP.position.y = -0.22;
        cp.add(coneP);

        const ballP = new THREE.Mesh(pinkBallGeo, pinkMat);
        ballP.position.y = -0.46;
        cp.add(ballP);

        collarGroup.add(cp);
    }
    kuromi3DGroup.add(collarGroup);

    // 5. DEVIL TAIL (Back of body with black arrow spade and pink base ball)
    kuromiTail = new THREE.Group();
    kuromiTail.position.set(0, 0.92, -0.72);

    const tailBaseBall = new THREE.Mesh(pinkBallGeo, pinkMat);
    kuromiTail.add(tailBaseBall);

    const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.25, 0.15, -0.35),
        new THREE.Vector3(0.40, 0.48, -0.45),
        new THREE.Vector3(0.48, 0.75, -0.32)
    ]);
    const tailTubeGeo = new THREE.TubeGeometry(tailCurve, 20, 0.05, 8, false);
    const tailTube = new THREE.Mesh(tailTubeGeo, blackMat);
    kuromiTail.add(tailTube);

    const spadeGeo = new THREE.ConeGeometry(0.20, 0.42, 4);
    const spade = new THREE.Mesh(spadeGeo, blackMat);
    spade.position.set(0.48, 0.88, -0.28);
    spade.rotation.z = -0.4;
    spade.rotation.x = -0.3;
    spade.scale.set(1.0, 1.0, 0.35);
    kuromiTail.add(spade);
    kuromi3DGroup.add(kuromiTail);

    // 6. HEAD & JESTER HOOD (With authentic Kuromi face and hood UV mapping)
    kuromiHead = new THREE.Group();
    kuromiHead.position.set(0, 2.75, 0);

    const headTex = textureLoader.load('kuromi_head_uv.png');
    headTex.encoding = THREE.sRGBEncoding;

    const headMat = new THREE.MeshStandardMaterial({
        map: headTex,
        roughness: 0.35,
        metalness: 0.05
    });

    const headGeo = new THREE.SphereGeometry(1.28, 36, 36);
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.scale.set(1.15, 1.02, 1.10);
    headMesh.rotation.y = -Math.PI / 2; // Orients front UV toward +Z
    headMesh.castShadow = true;
    kuromiHead.add(headMesh);

    // 7. JESTER EARS / HORNS
    function createJesterEar(isLeft = true) {
        const earGroup = new THREE.Group();
        const sign = isLeft ? -1 : 1;
        
        earGroup.position.set(sign * 0.72, 0.85, -0.08);
        earGroup.rotation.z = sign * -0.42;
        earGroup.rotation.x = -0.18;

        const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.65, 24), blackMat);
        s1.position.y = 0.32;
        earGroup.add(s1);

        const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 0.65, 24), blackMat);
        s2.position.set(sign * 0.06, 0.88, -0.04);
        s2.rotation.z = sign * -0.12;
        earGroup.add(s2);

        const s3 = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.26, 0.60, 24), blackMat);
        s3.position.set(sign * 0.16, 1.42, -0.10);
        s3.rotation.z = sign * -0.18;
        earGroup.add(s3);

        const tipBall = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), blackMat);
        tipBall.position.set(sign * 0.24, 1.76, -0.14);
        earGroup.add(tipBall);

        return earGroup;
    }

    kuromiHead.add(createJesterEar(true));
    kuromiHead.add(createJesterEar(false));

    kuromi3DGroup.add(kuromiHead);

    // Soft pink floor aura disc
    const floorAura = new THREE.Mesh(
        new THREE.CircleGeometry(1.6, 32),
        new THREE.MeshBasicMaterial({
            color: 0xff74b1,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        })
    );
    floorAura.rotation.x = -Math.PI / 2;
    floorAura.position.y = 0.02;
    kuromiGroup.add(floorAura);

    kuromiGroup.add(kuromi3DGroup);
    scene.add(kuromiGroup);
}

/* ==========================================================================
   6. SUNFLOWER BOUQUET (Tilted toward viewer with dense dome)
   ========================================================================== */
function initBouquet() {
    bouquetGroup = new THREE.Group();
    // Position at right
    bouquetGroup.position.set(2.4, 0, 0);
    // Tilt forward toward viewer so the flower dome is beautifully presented
    bouquetGroup.rotation.x = 0.35;
    bouquetGroup.rotation.y = -0.15;

    // 1. Bouquet Cone Wrapping (Deep onyx black luxury wrapping paper with golden trim)
    const coneHeight = 3.0;
    const coneRadiusTop = 2.2;
    const coneRadiusBottom = 0.38;
    const coneGeo = new THREE.CylinderGeometry(coneRadiusTop, coneRadiusBottom, coneHeight, 32, 1, true);
    
    const coneMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0e,
        roughness: 0.85,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = coneHeight / 2 + 0.4;
    cone.castShadow = true;
    bouquetGroup.add(cone);

    // Golden trim ring around top of cone
    const topRimGeo = new THREE.TorusGeometry(coneRadiusTop + 0.03, 0.05, 16, 48);
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.85,
        roughness: 0.25
    });
    const topRim = new THREE.Mesh(topRimGeo, goldMat);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = coneHeight + 0.4;
    bouquetGroup.add(topRim);

    // Stems emerging from bottom
    const stemGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.8, 16);
    const stemMat = new THREE.MeshStandardMaterial({
        color: 0x1c3814,
        roughness: 0.8
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.4;
    bouquetGroup.add(stem);

    // Golden ribbon bow around the cone
    const ribbonGeo = new THREE.TorusGeometry(0.78, 0.08, 16, 32);
    const ribbon = new THREE.Mesh(ribbonGeo, goldMat);
    ribbon.rotation.x = Math.PI / 2;
    ribbon.position.y = 1.35;
    bouquetGroup.add(ribbon);

    // 2. Sunflower Textures with sRGBEncoding
    const normalFlowerTex = textureLoader.load('sunflower.png');
    normalFlowerTex.encoding = THREE.sRGBEncoding;

    const faceFlowerTex = textureLoader.load('sunflower_face.png');
    faceFlowerTex.encoding = THREE.sRGBEncoding;

    // 3. Dense Sunflowers Dome
    const flowerGeo = new THREE.PlaneGeometry(0.95, 0.95);
    const flowerFaceGeo = new THREE.PlaneGeometry(1.4, 1.4);

    const flowerMat = new THREE.MeshBasicMaterial({
        map: normalFlowerTex,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide
    });

    const flowerFaceMat = new THREE.MeshBasicMaterial({
        map: faceFlowerTex,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide
    });

    // Center of the flower dome
    const domeCenterY = coneHeight + 0.25;
    const domeRadius = 2.0;

    // Distribute sunflowers across hemisphere
    const numFlowers = 75;
    for (let i = 0; i < numFlowers; i++) {
        const y = 1 - (i / (numFlowers - 1)) * 0.9;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = i * 2.3999632;

        const fx = domeRadius * radiusAtY * Math.cos(theta);
        const fz = domeRadius * radiusAtY * Math.sin(theta);
        const fy = domeCenterY + domeRadius * y * 0.72;

        const mesh = new THREE.Mesh(flowerGeo, flowerMat);
        mesh.rotation.z = Math.random() * Math.PI * 2;
        mesh.position.set(fx, fy, fz);

        const normal = new THREE.Vector3(fx, fy - domeCenterY, fz).normalize();
        mesh.lookAt(mesh.position.clone().add(normal));

        bouquetGroup.add(mesh);
    }

    // Cute sunflowers with face (distributed on the front/sides of dome)
    const facePositions = [
        { x: -0.45, y: domeCenterY + 0.42, z: 1.65, look: new THREE.Vector3(-0.15, 0.2, 1) },
        { x: 0.48, y: domeCenterY + 0.35, z: 1.62, look: new THREE.Vector3(0.18, 0.15, 1) },
        { x: -0.85, y: domeCenterY + 0.55, z: 1.25, look: new THREE.Vector3(-0.35, 0.25, 0.8) },
        { x: 0.10, y: domeCenterY + 0.75, z: 1.50, look: new THREE.Vector3(0.05, 0.4, 0.9) }
    ];
    facePositions.forEach(fp => {
        const faceMesh = new THREE.Mesh(flowerFaceGeo, flowerFaceMat);
        faceMesh.position.set(fp.x, fp.y, fp.z);
        faceMesh.lookAt(faceMesh.position.clone().add(fp.look));
        bouquetGroup.add(faceMesh);
    });

    scene.add(bouquetGroup);
}

/* ==========================================================================
   7. FLOATING ROMANTIC 3D TEXT CLOUD
   ========================================================================== */
function initFloatingTexts() {
    textCloudGroup = new THREE.Group();
    // Center texts around the bouquet position
    textCloudGroup.position.set(2.4, 0, 0);

    ROMANTIC_PHRASES.forEach((phraseObj, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');

        // Draw glowing pill badge
        ctx.clearRect(0, 0, 512, 140);
        
        const r = 38;
        const bx = 16, by = 16, bw = 480, bh = 108;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();

        ctx.fillStyle = 'rgba(18, 8, 32, 0.78)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = phraseObj.color;
        ctx.shadowColor = phraseObj.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        // Text typography
        ctx.font = 'bold 44px "Poppins", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = phraseObj.color;
        ctx.shadowBlur = 12;
        ctx.fillText(phraseObj.text, 256, 70);

        const tex = new THREE.CanvasTexture(canvas);
        tex.encoding = THREE.sRGBEncoding;

        const spriteMat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMat);
        
        // Arrange phrases in 3D orbit specifically around the bouquet
        const total = ROMANTIC_PHRASES.length;
        const angle = (index / total) * Math.PI * 2;
        const orbitRadius = 2.6 + (index % 3) * 0.45;
        const heightY = 2.5 + (index % 4) * 0.75;

        sprite.scale.set(2.2, 0.60, 1);
        sprite.position.set(
            Math.cos(angle) * orbitRadius,
            heightY,
            Math.sin(angle) * orbitRadius
        );

        sprite.userData = {
            baseAngle: angle,
            orbitRadius: orbitRadius,
            baseY: heightY,
            speed: 0.16 + (index % 3) * 0.04,
            bobSpeed: 1.4 + (index % 2) * 0.4
        };

        textCloudGroup.add(sprite);
    });

    scene.add(textCloudGroup);
}

/* ==========================================================================
   8. FLOATING PETALS & SPARKLES
   ========================================================================== */
function initFloatingPetals() {
    petalsGroup = new THREE.Group();

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    
    pCtx.save();
    pCtx.translate(32, 32);
    pCtx.rotate(Math.PI / 4);
    pCtx.beginPath();
    pCtx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
    pCtx.fillStyle = '#facc15';
    pCtx.shadowColor = '#f59e0b';
    pCtx.shadowBlur = 8;
    pCtx.fill();
    pCtx.restore();

    const petalTex = new THREE.CanvasTexture(pCanvas);
    petalTex.encoding = THREE.sRGBEncoding;

    const petalCount = 75;
    const petalGeo = new THREE.PlaneGeometry(0.35, 0.2);
    const petalMat = new THREE.MeshBasicMaterial({
        map: petalTex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    for (let i = 0; i < petalCount; i++) {
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(
            (Math.random() - 0.5) * 16,
            Math.random() * 8 + 0.5,
            (Math.random() - 0.5) * 16
        );
        petal.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        petal.userData = {
            fallSpeed: 0.01 + Math.random() * 0.02,
            rotSpeedX: (Math.random() - 0.5) * 0.03,
            rotSpeedY: (Math.random() - 0.5) * 0.03,
            swayFreq: 1 + Math.random() * 2,
            swayAmp: 0.012 + Math.random() * 0.015
        };
        petalsGroup.add(petal);
    }

    scene.add(petalsGroup);
}

/* ==========================================================================
   9. INTERACTION & EVENT LISTENERS
   ========================================================================== */
function initEventListeners() {
    window.addEventListener('resize', onWindowResize);

    // Auto-Rotate Button
    const btnAutoRotate = document.getElementById('btnAutoRotate');
    btnAutoRotate.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        controls.autoRotate = isAutoRotating;
        btnAutoRotate.classList.toggle('active', isAutoRotating);
    });

    // Focus Bouquet Button (Angled smoothly looking down into the sunflowers)
    const btnFocusBouquet = document.getElementById('btnFocusBouquet');
    btnFocusBouquet.addEventListener('click', () => {
        smoothCameraMove({ x: 2.4, y: 3.6, z: 4.6 }, { x: 2.4, y: 3.2, z: 0 });
    });

    // Focus Kuromi Button (Centered neatly showing full Kuromi with ears)
    const btnFocusKuromi = document.getElementById('btnFocusKuromi');
    btnFocusKuromi.addEventListener('click', () => {
        smoothCameraMove({ x: -2.8, y: 2.3, z: 6.8 }, { x: -2.8, y: 2.1, z: 0 });
    });

    // Reset View Button
    const btnResetView = document.getElementById('btnResetView');
    btnResetView.addEventListener('click', () => {
        smoothCameraMove({ x: 0, y: 3.4, z: 13.0 }, { x: 0, y: 2.2, z: 0 });
    });

    // Petal Burst Button
    const btnPetals = document.getElementById('btnPetals');
    btnPetals.addEventListener('click', () => {
        triggerPetalBurst();
    });

    // Modal Card Handlers
    const letterModal = document.getElementById('letterModal');
    const btnOpenCard = document.getElementById('btnOpenCard');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnEnterScene = document.getElementById('btnEnterScene');

    btnOpenCard.addEventListener('click', () => {
        letterModal.classList.remove('hidden');
    });

    btnCloseModal.addEventListener('click', () => {
        letterModal.classList.add('hidden');
    });

    btnEnterScene.addEventListener('click', () => {
        letterModal.classList.add('hidden');
        triggerPetalBurst();
    });
}

function smoothCameraMove(targetPos, targetLookAt) {
    // Temporarily pause auto rotate so controls don't fight tween
    isAutoRotating = false;
    controls.autoRotate = false;
    controls.enabled = false; // Temporarily disable OrbitControls during GSAP tween
    const btn = document.getElementById('btnAutoRotate');
    if (btn) btn.classList.remove('active');

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.4,
        ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: 1.4,
        ease: "power2.inOut",
        onComplete: () => {
            controls.enabled = true;
            controls.update();
        }
    });
}

function triggerPetalBurst() {
    confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#facc15', '#f59e0b', '#ff74b1', '#ff4d94', '#c084fc'],
        shapes: ['circle'],
        scalar: 1.2
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ==========================================================================
   10. ANIMATION LOOP
   ========================================================================== */
function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // 1. Kuromi 3D tracking & animations (always looks toward camera in 360°)
    if (kuromi3DGroup) {
        kuromi3DGroup.position.y = Math.sin(time * 2.2) * 0.05;

        // Smoothly rotate Kuromi to look wherever the camera is!
        const dx = camera.position.x - (-2.8);
        const dz = camera.position.z - 0;
        const targetAngle = Math.atan2(dx, dz);
        let diff = (targetAngle - kuromi3DGroup.rotation.y) % (Math.PI * 2);
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (diff > Math.PI) diff -= Math.PI * 2;
        kuromi3DGroup.rotation.y += diff * 0.08;
    }
    if (kuromiHead) {
        kuromiHead.rotation.z = Math.sin(time * 1.5) * 0.03;
    }
    if (kuromiRightArm) {
        // Playful waving hello towards camera!
        kuromiRightArm.rotation.z = -0.75 + Math.sin(time * 4.2) * 0.16;
    }
    if (kuromiTail) {
        // Wagging devil tail!
        kuromiTail.rotation.y = Math.sin(time * 3.5) * 0.22;
    }

    // 2. Bouquet subtle breathing
    if (bouquetGroup) {
        bouquetGroup.rotation.z = Math.sin(time * 0.8) * 0.03;
    }

    // 3. Floating 3D Texts orbiting around the bouquet
    if (textCloudGroup) {
        textCloudGroup.children.forEach(sprite => {
            const data = sprite.userData;
            const currentAngle = data.baseAngle + time * data.speed;
            sprite.position.x = Math.cos(currentAngle) * data.orbitRadius;
            sprite.position.z = Math.sin(currentAngle) * data.orbitRadius;
            sprite.position.y = data.baseY + Math.sin(time * data.bobSpeed) * 0.16;
        });
    }

    // 4. Ground neon ripples
    ripples.forEach(rip => {
        const scale = 1 + ((time * 0.4 + rip.userData.phase) % 1) * 1.2;
        rip.scale.set(scale, scale, 1);
        rip.material.opacity = Math.max(0, (1 - (scale - 1) / 1.2) * 0.6);
    });

    // 5. Floating Petals physics
    if (petalsGroup) {
        petalsGroup.children.forEach(petal => {
            const d = petal.userData;
            petal.position.y -= d.fallSpeed;
            petal.position.x += Math.sin(time * d.swayFreq) * d.swayAmp;
            petal.rotation.x += d.rotSpeedX;
            petal.rotation.y += d.rotSpeedY;

            if (petal.position.y < 0.1) {
                petal.position.y = 8.5;
                petal.position.x = (Math.random() - 0.5) * 16;
                petal.position.z = (Math.random() - 0.5) * 16;
            }
        });
    }

    // 6. Starfield gentle rotation
    if (starsGroup) {
        starsGroup.rotation.y = time * 0.015;
    }

    controls.update();
    renderer.render(scene, camera);
}
