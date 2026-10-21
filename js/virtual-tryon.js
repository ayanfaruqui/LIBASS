/* ================================================================
   LIBASS — Virtual Try-On Module
   Camera access, photo upload, garment overlay & customization
   ================================================================ */

(function () {
    'use strict';

    // ── DOM Elements ──
    const placeholder = document.getElementById('viewport-placeholder');
    const cameraFeed = document.getElementById('camera-feed');
    const uploadedImage = document.getElementById('uploaded-image');
    const overlayCanvas = document.getElementById('tryon-overlay');
    const controls = document.getElementById('viewport-controls');
    const podiumIndicator = document.getElementById('podium-indicator');
    const photoUploadInput = document.getElementById('photo-upload');
    const canvasArea = document.getElementById('tryon-canvas-area');

    const btnOpenCamera = document.getElementById('btn-open-camera');
    const btnUploadPhoto = document.getElementById('btn-upload-photo');
    const btnCapture = document.getElementById('btn-capture');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');
    const btnApply = document.getElementById('btn-apply-tryon');

    // ── State ──
    let currentStream = null;
    let activeMode = null; // 'camera' or 'photo'
    let selectedGarment = 'bridal';
    let selectedFabric = 'velvet';
    let selectedHem = 'straight';
    let sleeveLength = 75;
    let necklineDepth = 50;

    // ── Garment Colors ──
    const garmentColors = {
        bridal: { primary: '#8B1A1A', secondary: '#D4A574', accent: '#FFD700' },
        designer: { primary: '#B87333', secondary: '#F5EFE6', accent: '#C4953A' },
        evening: { primary: '#1B5E20', secondary: '#2E7D32', accent: '#FFD700' },
        anarkali: { primary: '#4A148C', secondary: '#7B1FA2', accent: '#C0C0C0' },
    };

    const fabricTextures = {
        velvet: { opacity: 0.9, pattern: 'solid', sheen: 0.3 },
        brocade: { opacity: 0.85, pattern: 'damask', sheen: 0.6 },
        silk: { opacity: 0.75, pattern: 'solid', sheen: 0.8 },
        chiffon: { opacity: 0.5, pattern: 'solid', sheen: 0.4 },
    };

    // ── Camera Access ──
    btnOpenCamera.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 960 },
                },
            });
            currentStream = stream;
            cameraFeed.srcObject = stream;
            cameraFeed.hidden = false;
            placeholder.hidden = true;
            controls.hidden = false;
            podiumIndicator.hidden = false;
            activeMode = 'camera';

            cameraFeed.onloadedmetadata = () => {
                setupOverlayCanvas(cameraFeed.videoWidth, cameraFeed.videoHeight);
                drawGarmentOverlay();
            };
        } catch (err) {
            console.warn('Camera access denied or unavailable:', err);
            showCameraError();
        }
    });

    function showCameraError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center; padding: 2rem; color: #d4a574;
        `;
        errorDiv.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p style="font-size: 0.9rem;">Camera access denied. Please upload a photo instead.</p>
        `;
        placeholder.hidden = true;
        canvasArea.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.remove();
            placeholder.hidden = false;
        }, 3000);
    }

    // ── Photo Upload ──
    btnUploadPhoto.addEventListener('click', () => photoUploadInput.click());

    photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            stopCamera();
            uploadedImage.src = event.target.result;
            uploadedImage.hidden = false;
            placeholder.hidden = true;
            controls.hidden = false;
            podiumIndicator.hidden = false;
            activeMode = 'photo';

            uploadedImage.onload = () => {
                setupOverlayCanvas(uploadedImage.naturalWidth, uploadedImage.naturalHeight);
                drawGarmentOverlay();
            };
        };
        reader.readAsDataURL(file);
    });

    // ── Overlay Canvas Setup ──
    function setupOverlayCanvas(width, height) {
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        overlayCanvas.hidden = false;
        overlayCanvas.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
        `;
    }

    // ── Draw Garment Overlay ──
    function drawGarmentOverlay() {
        if (!overlayCanvas || overlayCanvas.hidden) return;

        const ctx = overlayCanvas.getContext('2d');
        const w = overlayCanvas.width;
        const h = overlayCanvas.height;

        ctx.clearRect(0, 0, w, h);

        const colors = garmentColors[selectedGarment];
        const fabric = fabricTextures[selectedFabric];

        // Draw semi-transparent garment silhouette
        ctx.globalAlpha = fabric.opacity * 0.35;

        // Body/torso area
        const centerX = w * 0.5;
        const shoulderY = h * 0.25;
        const waistY = h * 0.5;
        const hemY = h * 0.82;

        // Garment silhouette
        ctx.beginPath();

        // Neckline
        const neckWidth = w * 0.12;
        const neckDepthPx = shoulderY + (necklineDepth / 100) * h * 0.08;

        ctx.moveTo(centerX - neckWidth, shoulderY);

        // Left shoulder to sleeve
        const shoulderWidth = w * 0.25;
        ctx.lineTo(centerX - shoulderWidth, shoulderY - h * 0.02);

        // Left sleeve
        const sleeveLengthPx = (sleeveLength / 100) * h * 0.2;
        ctx.lineTo(centerX - shoulderWidth - w * 0.05, shoulderY + sleeveLengthPx);
        ctx.lineTo(centerX - shoulderWidth + w * 0.02, shoulderY + sleeveLengthPx);

        // Left side of torso
        ctx.lineTo(centerX - w * 0.18, waistY);

        // Hem variation
        if (selectedHem === 'fishtail') {
            ctx.lineTo(centerX - w * 0.2, hemY);
            ctx.quadraticCurveTo(centerX - w * 0.15, hemY + h * 0.05, centerX, hemY);
            ctx.quadraticCurveTo(centerX + w * 0.15, hemY + h * 0.05, centerX + w * 0.2, hemY);
        } else if (selectedHem === 'asymmetric') {
            ctx.lineTo(centerX - w * 0.22, hemY + h * 0.04);
            ctx.lineTo(centerX + w * 0.18, hemY - h * 0.03);
        } else {
            ctx.lineTo(centerX - w * 0.2, hemY);
            ctx.lineTo(centerX + w * 0.2, hemY);
        }

        // Right side
        ctx.lineTo(centerX + w * 0.18, waistY);

        // Right sleeve
        ctx.lineTo(centerX + shoulderWidth - w * 0.02, shoulderY + sleeveLengthPx);
        ctx.lineTo(centerX + shoulderWidth + w * 0.05, shoulderY + sleeveLengthPx);
        ctx.lineTo(centerX + shoulderWidth, shoulderY - h * 0.02);

        // Right shoulder to neckline
        ctx.lineTo(centerX + neckWidth, shoulderY);

        // Neckline curve
        ctx.quadraticCurveTo(centerX, neckDepthPx, centerX - neckWidth, shoulderY);

        ctx.closePath();

        // Fill with garment color
        const gradient = ctx.createLinearGradient(centerX - shoulderWidth, shoulderY, centerX + shoulderWidth, hemY);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.5, colors.secondary);
        gradient.addColorStop(1, colors.primary);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add pattern for brocade
        if (fabric.pattern === 'damask') {
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 1;
            for (let y = shoulderY; y < hemY; y += 20) {
                for (let x = centerX - shoulderWidth; x < centerX + shoulderWidth; x += 20) {
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        // Add sheen effect
        ctx.globalAlpha = fabric.sheen * 0.15;
        const sheenGradient = ctx.createLinearGradient(centerX - w * 0.1, shoulderY, centerX + w * 0.1, hemY);
        sheenGradient.addColorStop(0, 'rgba(255,255,255,0)');
        sheenGradient.addColorStop(0.3, 'rgba(255,255,255,0.5)');
        sheenGradient.addColorStop(0.7, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheenGradient;
        ctx.fill();

        // Embroidery details (accent color)
        ctx.globalAlpha = fabric.opacity * 0.25;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;

        // Neckline embroidery
        ctx.beginPath();
        ctx.moveTo(centerX - neckWidth * 0.8, shoulderY + 5);
        ctx.quadraticCurveTo(centerX, neckDepthPx + 15, centerX + neckWidth * 0.8, shoulderY + 5);
        ctx.stroke();

        // Waist detail
        ctx.beginPath();
        ctx.moveTo(centerX - w * 0.16, waistY);
        ctx.lineTo(centerX + w * 0.16, waistY);
        ctx.stroke();

        ctx.globalAlpha = 1;

        // Draw copper podium at bottom
        drawPodium(ctx, w, h);
    }

    function drawPodium(ctx, w, h) {
        const podiumY = h * 0.88;

        // Podium shadow
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, podiumY + 10, w * 0.25, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Podium top
        ctx.globalAlpha = 0.6;
        const podiumGrad = ctx.createLinearGradient(w * 0.3, podiumY, w * 0.7, podiumY + 20);
        podiumGrad.addColorStop(0, '#b87333');
        podiumGrad.addColorStop(0.5, '#d4956a');
        podiumGrad.addColorStop(1, '#b87333');
        ctx.fillStyle = podiumGrad;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, podiumY, w * 0.25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Podium glow
        ctx.globalAlpha = 0.2;
        ctx.shadowColor = '#b87333';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1;
    }

    // ── Garment Selection ──
    const garmentCards = document.querySelectorAll('.garment-card');
    garmentCards.forEach((card) => {
        card.addEventListener('click', () => {
            garmentCards.forEach((c) => c.classList.remove('active'));
            card.classList.add('active');
            selectedGarment = card.getAttribute('data-garment');
            drawGarmentOverlay();
        });
    });

    // ── Fabric Selection ──
    const fabricBtns = document.querySelectorAll('.fabric-btn');
    fabricBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            fabricBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFabric = btn.getAttribute('data-fabric');
            drawGarmentOverlay();
        });
    });

    // ── Hem Selection ──
    const hemBtns = document.querySelectorAll('.hem-btn');
    hemBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            hemBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedHem = btn.getAttribute('data-hem');
            drawGarmentOverlay();
        });
    });

    // ── Slider Controls ──
    const sleeveSlider = document.getElementById('sleeve-length');
    const necklineSlider = document.getElementById('neckline-depth');

    if (sleeveSlider) {
        sleeveSlider.addEventListener('input', (e) => {
            sleeveLength = parseInt(e.target.value);
            drawGarmentOverlay();
        });
    }

    if (necklineSlider) {
        necklineSlider.addEventListener('input', (e) => {
            necklineDepth = parseInt(e.target.value);
            drawGarmentOverlay();
        });
    }

    // ── Apply Button ──
    if (btnApply) {
        btnApply.addEventListener('click', () => {
            if (!activeMode) {
                // Pulse the placeholder buttons
                const placeholderBtns = document.querySelector('.placeholder-buttons');
                if (placeholderBtns) {
                    placeholderBtns.style.animation = 'none';
                    placeholderBtns.offsetHeight; // Force reflow
                    placeholderBtns.style.animation = 'shake 0.5s ease';
                }
                return;
            }
            drawGarmentOverlay();

            // Success feedback
            btnApply.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Applied Successfully!
            `;
            btnApply.style.background = 'linear-gradient(135deg, #2d8b55, #3cad6e)';

            setTimeout(() => {
                btnApply.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Apply to My Look
                `;
                btnApply.style.background = '';
            }, 2000);
        });
    }

    // ── Capture Screenshot ──
    if (btnCapture) {
        btnCapture.addEventListener('click', () => {
            if (!activeMode) return;

            const captureCanvas = document.createElement('canvas');
            const sourceEl = activeMode === 'camera' ? cameraFeed : uploadedImage;
            captureCanvas.width = sourceEl.videoWidth || sourceEl.naturalWidth;
            captureCanvas.height = sourceEl.videoHeight || sourceEl.naturalHeight;

            const ctx = captureCanvas.getContext('2d');
            ctx.drawImage(sourceEl, 0, 0);

            // Draw overlay on top
            if (overlayCanvas) {
                ctx.drawImage(overlayCanvas, 0, 0, captureCanvas.width, captureCanvas.height);
            }

            // Convert to image and display
            const dataUrl = captureCanvas.toDataURL('image/png');
            stopCamera();
            uploadedImage.src = dataUrl;
            uploadedImage.hidden = false;
            cameraFeed.hidden = true;
            activeMode = 'photo';

            // Flash effect
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: white; opacity: 0.8; z-index: 10;
                transition: opacity 0.5s;
            `;
            canvasArea.appendChild(flash);
            setTimeout(() => { flash.style.opacity = '0'; }, 50);
            setTimeout(() => flash.remove(), 500);
        });
    }

    // ── Download ──
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            if (!activeMode) return;

            const downloadCanvas = document.createElement('canvas');
            const sourceEl = activeMode === 'camera' ? cameraFeed : uploadedImage;
            downloadCanvas.width = sourceEl.videoWidth || sourceEl.naturalWidth || 800;
            downloadCanvas.height = sourceEl.videoHeight || sourceEl.naturalHeight || 600;

            const ctx = downloadCanvas.getContext('2d');
            ctx.drawImage(sourceEl, 0, 0, downloadCanvas.width, downloadCanvas.height);

            if (overlayCanvas) {
                ctx.drawImage(overlayCanvas, 0, 0, downloadCanvas.width, downloadCanvas.height);
            }

            const link = document.createElement('a');
            link.download = `LIBASS-VirtualTryOn-${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
        });
    }

    // ── Reset ──
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            stopCamera();
            uploadedImage.hidden = true;
            uploadedImage.src = '';
            overlayCanvas.hidden = true;
            controls.hidden = true;
            podiumIndicator.hidden = true;
            placeholder.hidden = false;
            activeMode = null;
            photoUploadInput.value = '';
        });
    }

    // ── Helpers ──
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
            currentStream = null;
        }
        cameraFeed.hidden = true;
        cameraFeed.srcObject = null;
    }

})();
