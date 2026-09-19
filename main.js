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

// References for billboarding
let kuromiMesh, kuromiAuraMesh;

/* ==========================================================================
   5. KUROMI CHARACTER
   ========================================================================== */
function initKuromi() {
    kuromiGroup = new THREE.Group();
    kuromiGroup.position.set(-2.8, 0, 0);

    // Load Kuromi Character texture
    textureLoader.load('kuromi_char.png', (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const aspect = 533 / 712;
        const height = 4.4;
        const width = height * aspect;

        const kuromiGeo = new THREE.PlaneGeometry(width, height);
        const kuromiMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.02,
            side: THREE.DoubleSide
        });

        kuromiMesh = new THREE.Mesh(kuromiGeo, kuromiMat);
        kuromiMesh.position.set(0, height / 2 + 0.05, 0);
        kuromiGroup.add(kuromiMesh);

        // Soft pink aura plane behind Kuromi
        const auraCanvas = document.createElement('canvas');
        auraCanvas.width = 128;
        auraCanvas.height = 128;
        const aCtx = auraCanvas.getContext('2d');
        const aGrad = aCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
        aGrad.addColorStop(0, 'rgba(255, 116, 177, 0.55)');
        aGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.28)');
        aGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        aCtx.fillStyle = aGrad;
        aCtx.fillRect(0, 0, 128, 128);

        const auraTex = new THREE.CanvasTexture(auraCanvas);
        auraTex.encoding = THREE.sRGBEncoding;
        const auraGeo = new THREE.PlaneGeometry(width * 1.5, height * 1.4);
        const auraMat = new THREE.MeshBasicMaterial({
            map: auraTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        kuromiAuraMesh = new THREE.Mesh(auraGeo, auraMat);
        kuromiAuraMesh.position.set(0, height / 2, -0.05);
        kuromiGroup.add(kuromiAuraMesh);
    });

    // Load stylized Kuromi Logo
    textureLoader.load('kuromi_logo.png', (logoTex) => {
        logoTex.encoding = THREE.sRGBEncoding;
        const logoAspect = 493 / 136;
        const lWidth = 2.4;
        const lHeight = lWidth / logoAspect;

        const logoGeo = new THREE.PlaneGeometry(lWidth, lHeight);
        const logoMat = new THREE.MeshBasicMaterial({
            map: logoTex,
            transparent: true,
            alphaTest: 0.05,
            side: THREE.DoubleSide
        });
        const logoMesh = new THREE.Mesh(logoGeo, logoMat);
        logoMesh.position.set(0, 0.12, 1.4);
        logoMesh.rotation.x = -Math.PI / 5;
        kuromiGroup.add(logoMesh);
    });

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
        smoothCameraMove({ x: -2.8, y: 2.4, z: 5.4 }, { x: -2.8, y: 2.2, z: 0 });
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

    // 1. Kuromi idle breathing & floating + Always face camera (Billboard)
    if (kuromiGroup) {
        kuromiGroup.position.y = Math.sin(time * 2.2) * 0.08;
    }
    if (kuromiMesh) {
        // Billboard around Y axis to face the camera continuously in 360 degrees
        const angle = Math.atan2(camera.position.x - (-2.8), camera.position.z - 0);
        kuromiMesh.rotation.y = angle;
        if (kuromiAuraMesh) {
            kuromiAuraMesh.rotation.y = angle;
        }
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
