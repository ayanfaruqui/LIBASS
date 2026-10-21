/* ================================================================
   Three.js — Flowing Silk Fabric Background
   Reacts to mouse movement with gentle undulations
   ================================================================ */

(function () {
    'use strict';

    const canvas = document.getElementById('silk-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // ── Scene Setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x1a0a0a, 0.6);

    // ── Mouse tracking ──
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });

    // ── Silk Fabric Shader ──
    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec2 vUv;
        varying float vElevation;

        // Simplex-like noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g  = step(x0.yzx, x0.xyz);
            vec3 l  = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x  = x_ * ns.x + ns.yyyy;
            vec4 y  = y_ * ns.x + ns.yyyy;
            vec4 h  = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Main flowing wave
            float wave1 = snoise(vec3(pos.x * 1.5 + uTime * 0.3, pos.y * 1.2 + uTime * 0.2, uTime * 0.15));
            float wave2 = snoise(vec3(pos.x * 2.5 - uTime * 0.2, pos.y * 2.0 + uTime * 0.25, uTime * 0.1 + 5.0));
            float wave3 = snoise(vec3(pos.x * 0.8 + uTime * 0.1, pos.y * 0.6 - uTime * 0.15, uTime * 0.08));

            // Mouse influence
            float distToMouse = length(pos.xy - uMouse * 2.0);
            float mouseInfluence = smoothstep(2.5, 0.0, distToMouse) * 0.4;
            float mouseWave = sin(distToMouse * 3.0 - uTime * 2.0) * mouseInfluence;

            float elevation = wave1 * 0.15 + wave2 * 0.08 + wave3 * 0.12 + mouseWave;
            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
            // Deep mahogany base colors
            vec3 color1 = vec3(0.102, 0.039, 0.039);  // Dark mahogany
            vec3 color2 = vec3(0.176, 0.078, 0.078);  // Rich brown
            vec3 color3 = vec3(0.722, 0.451, 0.2);    // Copper accent

            // Mix based on elevation and position
            float mixFactor = (vElevation + 0.2) * 2.0;
            vec3 color = mix(color1, color2, vUv.y * 0.8 + sin(vUv.x * 3.14) * 0.2);

            // Add copper highlights on peaks
            float highlight = smoothstep(0.08, 0.25, vElevation);
            color = mix(color, color3, highlight * 0.3);

            // Subtle shimmer
            float shimmer = sin(vUv.x * 20.0 + uTime * 0.5) * sin(vUv.y * 15.0 - uTime * 0.3);
            color += vec3(shimmer * 0.02);

            // Edge darkening
            float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) *
                             smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            color *= edgeFade * 0.6 + 0.4;

            // Alpha with edge fade
            float alpha = edgeFade * 0.7;

            gl_FragColor = vec4(color, alpha);
        }
    `;

    // ── Create Silk Mesh ──
    const geometry = new THREE.PlaneGeometry(8, 6, 128, 96);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
    });

    const silkMesh = new THREE.Mesh(geometry, material);
    silkMesh.rotation.x = -0.2;
    scene.add(silkMesh);

    // ── Floating Particles (copper dust) ──
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 10;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        particleSizes[i] = Math.random() * 3 + 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xb87333,
        size: 0.02,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ── Animation Loop ──
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();

        // Smooth mouse following
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Update uniforms
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);

        // Gentle camera sway
        camera.position.x = Math.sin(elapsed * 0.1) * 0.15 + mouse.x * 0.3;
        camera.position.y = Math.cos(elapsed * 0.12) * 0.1 + mouse.y * 0.2;
        camera.lookAt(0, 0, 0);

        // Animate particles
        const positions = particleGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.001;
            positions[i * 3] += Math.cos(elapsed * 0.5 + i * 0.5) * 0.0005;

            // Reset particles that drift too far
            if (positions[i * 3 + 1] > 4) positions[i * 3 + 1] = -4;
            if (positions[i * 3 + 1] < -4) positions[i * 3 + 1] = 4;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // ── Resize Handler ──
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // ── Visibility API - pause when hidden ──
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
})();
