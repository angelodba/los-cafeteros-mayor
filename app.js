/**
 * LOS CAFETEROS — FERIA DE HORTALIZAS CARACAS
 * Catalogo, Cotizador, WhatsApp + WebGL Engine (Three.js + GSAP + Lenis)
 * v5.0 — Awwwards Editorial Style
 */

/* ============================================================
   WEBGL ENGINE — Three.js Particles Scene
   ============================================================ */
(function initWebGLEngine() {
    'use strict';
    var canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var dl1 = new THREE.DirectionalLight(0xB7F34B, 1.4);
    dl1.position.set(5, 8, 5);
    scene.add(dl1);
    var dl2 = new THREE.DirectionalLight(0xD81E13, 0.7);
    dl2.position.set(-5, -3, 3);
    scene.add(dl2);
    var pl = new THREE.PointLight(0xF5A611, 1.6, 20);
    pl.position.set(0, 4, 4);
    scene.add(pl);

    // Color palette (brand)
    var COLORS = [0x65A61A, 0xB7F34B, 0xD81E13, 0xF5A611, 0x7A4222, 0xE8E0C5];

    var particleGroup = new THREE.Group();
    scene.add(particleGroup);

    var geometries = [
        new THREE.IcosahedronGeometry(0.24, 0),
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.TetrahedronGeometry(0.28, 0),
        new THREE.DodecahedronGeometry(0.20, 0),
        new THREE.SphereGeometry(0.18, 8, 6)
    ];

    var particles = [];
    var PARTICLE_COUNT = 36;

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        var geo = geometries[Math.floor(Math.random() * geometries.length)];
        var color = COLORS[Math.floor(Math.random() * COLORS.length)];
        var isMetallic = Math.random() > 0.4;
        var mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: isMetallic ? 0.12 : 0.65,
            metalness: isMetallic ? 0.88 : 0.1,
            transparent: true,
            opacity: 0.65 + Math.random() * 0.35
        });
        var mesh = new THREE.Mesh(geo, mat);
        var spread = 10;
        mesh.position.set(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread * 0.75,
            (Math.random() - 0.5) * 4 - 1
        );
        mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        var sc = 0.5 + Math.random() * 1.2;
        mesh.scale.setScalar(sc);
        particleGroup.add(mesh);
        particles.push({
            mesh: mesh,
            basePos: mesh.position.clone(),
            rotSpd: new THREE.Vector3((Math.random()-0.5)*0.009, (Math.random()-0.5)*0.011, (Math.random()-0.5)*0.007),
            floatAmp: 0.15 + Math.random() * 0.28,
            floatFreq: 0.35 + Math.random() * 0.6,
            floatOff: Math.random() * Math.PI * 2
        });
    }

    var mouse = { x: 0, y: 0 };
    var tRot = { x: 0, y: 0 };
    document.addEventListener('mousemove', function(e) {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    var clock = 0;
    var scrollProg = 0;

    function animate() {
        requestAnimationFrame(animate);
        clock += 0.01;

        tRot.x += (mouse.y * 0.12 - tRot.x) * 0.04;
        tRot.y += (mouse.x * 0.18 - tRot.y) * 0.04;
        particleGroup.rotation.x = tRot.x;
        particleGroup.rotation.y = tRot.y;

        camera.position.z = 8 + scrollProg * 2.5;
        camera.position.y = -scrollProg * 1.8;

        for (var j = 0; j < particles.length; j++) {
            var p = particles[j];
            p.mesh.position.x = p.basePos.x + Math.cos(clock * p.floatFreq * 0.7 + p.floatOff) * p.floatAmp * 0.5;
            p.mesh.position.y = p.basePos.y + Math.sin(clock * p.floatFreq + p.floatOff) * p.floatAmp;
            p.mesh.rotation.x += p.rotSpd.x;
            p.mesh.rotation.y += p.rotSpd.y;
            p.mesh.rotation.z += p.rotSpd.z;
        }

        renderer.render(scene, camera);
    }
    animate();

    window._webglSetScroll = function(prog) { scrollProg = prog; };
})();

/* ============================================================
   PAGE LOADER
   ============================================================ */
(function initLoader() {
    var loader = document.getElementById('page-loader');
    var fill = document.getElementById('loader-fill');
    var pct = document.getElementById('loader-percent');
    if (!loader) return;

    var prog = 0;
    var iv = setInterval(function() {
        var inc = prog < 70 ? 8 + Math.random() * 12 : 2 + Math.random() * 4;
        prog = Math.min(prog + inc, 95);
        if (fill) fill.style.width = prog + '%';
        if (pct) pct.textContent = 'CARGANDO... ' + Math.round(prog) + '%';
    }, 100);

    window.addEventListener('load', function() {
        clearInterval(iv);
        if (fill) fill.style.width = '100%';
        if (pct) pct.textContent = 'SISTEMA LISTO · 100%';
        setTimeout(function() {
            loader.classList.add('hidden');
            var c = document.getElementById('webgl-canvas');
            if (c) c.classList.add('visible');
        }, 500);
    });
})();

/* ============================================================
   LENIS SMOOTH SCROLL + GSAP BRIDGE
   ============================================================ */
(function initLenis() {
    if (typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smooth: true
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    } else {
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }

    lenis.on('scroll', function(e) {
        if (window._webglSetScroll) window._webglSetScroll(e.progress);
    });

    window._lenis = lenis;
})();

/* ============================================================
   HEADER SCROLL EFFECT
   ============================================================ */
(function initHeaderScroll() {
    var header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 60) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }, { passive: true });
})();

/* ============================================================
   TECH FRAME CLOCK
   ============================================================ */
(function initTechClock() {
    var el = document.getElementById('frame-time');
    if (!el) return;
    function tick() {
        var now = new Date();
        el.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ' HRS';
    }
    tick();
    setInterval(tick, 30000);
})();

/* ============================================================
   GSAP SCROLL ANIMATIONS
   ============================================================ */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Hero elements fade in
    document.querySelectorAll('.hero-content .gsap-fade-up').forEach(function(el, i) {
        gsap.fromTo(el,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.9, delay: 0.2 + i * 0.11, ease: 'power3.out' }
        );
    });

    // Scroll-triggered section titles
    if (typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.section-title.gsap-fade-up, .section-subtitle.gsap-fade-up').forEach(function(el) {
            gsap.fromTo(el,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                  scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
            );
        });
    }
}

/* ============================================================
   PRODUCT CARD ENTRANCE ANIMATION
   ============================================================ */
function animateProductCards() {
    var cards = document.querySelectorAll('.product-card');
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        cards.forEach(function(card, i) {
            gsap.fromTo(card,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.55, delay: (i % 4) * 0.07, ease: 'power3.out',
                  scrollTrigger: { trigger: card, start: 'top 94%', toggleActions: 'play none none none' } }
            );
        });
    } else {
        cards.forEach(function(card) {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
    }
}

// --- Base de Datos de Hortalizas, Frutas y Víveres (Precios al Detal & Al Mayor Actualizados) ---
const PRODUCTS = [
    // --- FRUTAS ---
    {
        id: 'aguacate-polo',
        name: 'Aguacate Polo',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.55,
        wholesaleNote: 'Cesta 30 kg ($46.50)',
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🥑',
        highlight: 'Firme y Mantecoso · $1.99/kg',
        tags: ['aguacate', 'polo', 'fruta', 'saludable']
    },
    {
        id: 'arandanos',
        name: 'Arándanos Frescos',
        category: 'frutas',
        priceDetal: 3.80,
        priceMayor: 3.20,
        minWholesaleQty: 10,
        unit: 'cajita',
        emoji: '🫐',
        highlight: 'Súper Antiox / Cajita',
        tags: ['arandanos', 'berry', 'fruta', 'gourmet']
    },
    {
        id: 'cambur',
        name: 'Cambur Guineo',
        category: 'frutas',
        priceDetal: 0.99,
        priceMayor: 1.13,
        wholesaleNote: 'Cesta 20 kg ($22.60)',
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🍌',
        highlight: 'Oferta $0.99/kg',
        tags: ['cambur', 'guineo', 'banano', 'fruta']
    },
    {
        id: 'cambur-manzano',
        name: 'Cambur Manzano',
        category: 'frutas',
        priceDetal: 0.99,
        priceMayor: 0.90,
        wholesaleNote: 'Cesta 20 kg ($18.00)',
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🍌',
        highlight: 'Sabor Dulce $0.99/kg',
        tags: ['cambur', 'manzano', 'fruta']
    },
    {
        id: 'ciruela',
        name: 'Ciruela Fresca',
        category: 'frutas',
        priceDetal: 1.98,
        priceMayor: 1.98,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🍑',
        highlight: 'Jugosa y Fresca',
        tags: ['ciruela', 'fruta', 'dulce']
    },
    {
        id: 'coco-agua',
        name: 'Coco de Agua',
        category: 'frutas',
        priceDetal: 1.20,
        priceMayor: 1.20,
        minWholesaleQty: 10,
        unit: 'unid',
        emoji: '🥥',
        highlight: 'Refrescante Natural',
        tags: ['coco', 'agua', 'fruta', 'unidad']
    },
    {
        id: 'coco',
        name: 'Coco Seco',
        category: 'frutas',
        priceDetal: 0.99,
        priceMayor: 0.99,
        minWholesaleQty: 10,
        unit: 'unid',
        emoji: '🥥',
        highlight: 'Ideal para Repostería',
        tags: ['coco', 'seco', 'fruta', 'unidad']
    },
    {
        id: 'durazno',
        name: 'Durazno Seleccionado',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.80,
        wholesaleNote: 'Cesta 30 kg ($84.00)',
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍑',
        highlight: 'Calidad Premium $2.99/kg',
        tags: ['durazno', 'fruta', 'fresco', 'postre']
    },
    {
        id: 'guanabana',
        name: 'Guanábana Nacional',
        category: 'frutas',
        priceDetal: 2.98,
        priceMayor: 2.80,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍈',
        highlight: 'Pulpa Rendidora',
        tags: ['guanabana', 'jugo', 'fruta']
    },
    {
        id: 'guayaba',
        name: 'Guayaba Dulce',
        category: 'frutas',
        priceDetal: 0.99,
        priceMayor: 0.97,
        wholesaleNote: 'Cesta 30 kg ($29.10)',
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍈',
        highlight: 'Cesta 30 kg a $29.10',
        tags: ['guayaba', 'jugo', 'dulce', 'fruta']
    },
    {
        id: 'lechosa',
        name: 'Lechosa Maradol',
        category: 'frutas',
        priceDetal: 0.99,
        priceMayor: 0.99,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍈',
        highlight: 'Dulzura Natural $0.99/kg',
        tags: ['lechosa', 'papaya', 'jugo', 'fruta']
    },
    {
        id: 'limon',
        name: 'Limón Criollo / Persa',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.55,
        wholesaleNote: 'Cesta 30 kg ($46.50)',
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍋',
        highlight: '100% Jugoso · $1.99/kg',
        tags: ['limon', 'limones', 'citrico', 'jugos']
    },
    {
        id: 'lulo',
        name: 'Lulo / Naranjilla',
        category: 'frutas',
        priceDetal: 2.98,
        priceMayor: 2.98,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍊',
        highlight: 'Para Jugos y Cocteles',
        tags: ['lulo', 'naranjilla', 'jugo', 'fruta']
    },
    {
        id: 'mandarina',
        name: 'Mandarina Jugosa',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.20,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍊',
        highlight: 'Cítrico de Temporada',
        tags: ['mandarina', 'citrico', 'fruta']
    },
    {
        id: 'manga',
        name: 'Manga Seleccionada',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.10,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🥭',
        highlight: 'Firme y Dulce',
        tags: ['manga', 'mango', 'fruta', 'jugo']
    },
    {
        id: 'melon',
        name: 'Melón Dulce',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.10,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍈',
        highlight: 'Alto Rendimiento',
        tags: ['melon', 'fruta', 'jugo']
    },
    {
        id: 'naranja',
        name: 'Naranja Criolla',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.70,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍊',
        highlight: '100% Jugo Natural',
        tags: ['naranja', 'criolla', 'jugo', 'citrico']
    },
    {
        id: 'naranja-tangelo',
        name: 'Naranja Tangelo',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.55,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍊',
        highlight: 'Sabor Dulce Intenso',
        tags: ['naranja', 'tangelo', 'citrico']
    },
    {
        id: 'parchita',
        name: 'Parchita Concentrada',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.40,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🟡',
        highlight: 'Ideal para Postres & Jugos',
        tags: ['parchita', 'maracuya', 'jugo']
    },
    {
        id: 'patilla',
        name: 'Patilla Dulce',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.40,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍉',
        highlight: 'Roja y Jugosa',
        tags: ['patilla', 'sandia', 'fruta']
    },
    {
        id: 'pina-oromiel',
        name: 'Piña Oromiel',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.10,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍍',
        highlight: 'Súper Dulce Oromiel',
        tags: ['pina', 'piña', 'oromiel']
    },
    {
        id: 'pina',
        name: 'Piña Nacional',
        category: 'frutas',
        priceDetal: 1.99,
        priceMayor: 1.60,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🍍',
        highlight: 'Excelente Sabor',
        tags: ['pina', 'piña', 'fruta']
    },
    {
        id: 'tomate-arbol',
        name: 'Tomate de Árbol',
        category: 'frutas',
        priceDetal: 2.99,
        priceMayor: 2.90,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍅',
        highlight: 'Para Jugos Tradicionales',
        tags: ['tomate de arbol', 'jugo']
    },
    {
        id: 'manzana-roja',
        name: 'Manzana Roja Seleccionada',
        category: 'frutas',
        priceDetal: 5.30,
        priceMayor: 4.80,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍎',
        highlight: 'Crujiente y Dulce',
        tags: ['manzana', 'roja', 'fruta']
    },
    {
        id: 'manzana-verde',
        name: 'Manzana Verde Crispy',
        category: 'frutas',
        priceDetal: 5.30,
        priceMayor: 4.80,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍏',
        highlight: 'Ácida e Ensaladas',
        tags: ['manzana', 'verde', 'fruta']
    },
    {
        id: 'manzana-amarilla',
        name: 'Manzana Amarilla Premium',
        category: 'frutas',
        priceDetal: 6.00,
        priceMayor: 4.80,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍎',
        highlight: 'Calidad Importada',
        tags: ['manzana', 'amarilla', 'gourmet']
    },
    {
        id: 'kiwi',
        name: 'Kiwi de Calidad',
        category: 'frutas',
        priceDetal: 10.00,
        priceMayor: 8.60,
        wholesaleNote: 'Caja 10 kg ($86.00)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥝',
        highlight: 'Caja 10 kg a $86.00',
        tags: ['kiwi', 'gourmet', 'fruta']
    },
    {
        id: 'pera',
        name: 'Pera Seleccionada',
        category: 'frutas',
        priceDetal: 4.80,
        priceMayor: 4.60,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍐',
        highlight: 'Textura Miel',
        tags: ['pera', 'fruta', 'gourmet']
    },
    {
        id: 'uva-roja',
        name: 'Uva Roja Premium',
        category: 'frutas',
        priceDetal: 13.00,
        priceMayor: 12.00,
        minWholesaleQty: 5,
        unit: 'kg',
        emoji: '🍇',
        highlight: 'Sabor Dulce Superior',
        tags: ['uva', 'roja', 'gourmet']
    },
    {
        id: 'uva-verde',
        name: 'Uva Verde sin Semilla',
        category: 'frutas',
        priceDetal: 15.00,
        priceMayor: 14.00,
        minWholesaleQty: 5,
        unit: 'kg',
        emoji: '🍇',
        highlight: 'Grado Especial Importada',
        tags: ['uva', 'verde', 'gourmet']
    },

    // --- HOJAS Y HIERBAS (MONTE) ---
    {
        id: 'acelga',
        name: 'Acelga Fresca',
        category: 'hojas',
        priceDetal: 1.99,
        priceMayor: 1.50,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Hojas Verdes Nutritivas',
        tags: ['acelga', 'hoja', 'verde']
    },
    {
        id: 'albahaca',
        name: 'Albahaca Aromática',
        category: 'hojas',
        priceDetal: 0.99,
        priceMayor: 3.80,
        minWholesaleQty: 5,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Paquete Fresco $0.99',
        tags: ['albahaca', 'pesto', 'hierba']
    },
    {
        id: 'celery',
        name: 'Celery / Apio España',
        category: 'hojas',
        priceDetal: 1.99,
        priceMayor: 1.50,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Crujiente para Ensaladas & Jugos',
        tags: ['celery', 'apio españa', 'jugo verde']
    },
    {
        id: 'cebollin',
        name: 'Cebollín Fresco',
        category: 'alinos',
        priceDetal: 1.99,
        priceMayor: 1.40,
        wholesaleNote: 'Cesta 10 kg ($14.00)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🧅',
        highlight: 'Cesta 10 kg a $14.00',
        tags: ['cebollin', 'cesta', 'aliño']
    },
    {
        id: 'cilantro',
        name: 'Cilantro Fresco',
        category: 'alinos',
        priceDetal: 0.99,
        priceMayor: 1.30,
        minWholesaleQty: 10,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Paquete $0.99',
        tags: ['cilantro', 'aliño', 'sofrito']
    },
    {
        id: 'curcuma',
        name: 'Cúrcuma Fresca',
        category: 'alinos',
        priceDetal: 1.99,
        priceMayor: 0.90,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🌿',
        highlight: 'Saludable y Colorante',
        tags: ['curcuma', 'raiz', 'aliño']
    },
    {
        id: 'hierbabuena',
        name: 'Hierbabuena / Menta',
        category: 'hojas',
        priceDetal: 0.99,
        priceMayor: 1.60,
        minWholesaleQty: 5,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Paquete $0.99',
        tags: ['hierbabuena', 'menta', 'infusion']
    },
    {
        id: 'jengibre',
        name: 'Jengibre Fresco',
        category: 'alinos',
        priceDetal: 1.99,
        priceMayor: 1.98,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🌿',
        highlight: 'Picor y Aroma Natural',
        tags: ['jengibre', 'raiz', 'aliño']
    },
    {
        id: 'menta',
        name: 'Menta Fresca',
        category: 'hojas',
        priceDetal: 0.99,
        priceMayor: 0.99,
        minWholesaleQty: 5,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Aroma Fresco Coctelería',
        tags: ['menta', 'hoja', 'infusion']
    },
    {
        id: 'perejil-rizado',
        name: 'Perejil Rizado',
        category: 'alinos',
        priceDetal: 0.99,
        priceMayor: 0.99,
        minWholesaleQty: 5,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Gourmet Paquete $0.99',
        tags: ['perejil', 'rizado', 'aliño']
    },
    {
        id: 'perejil-liso',
        name: 'Perejil Liso',
        category: 'alinos',
        priceDetal: 0.99,
        priceMayor: 1.50,
        minWholesaleQty: 5,
        unit: 'paquete',
        emoji: '🌿',
        highlight: 'Tradicional Paquete $0.99',
        tags: ['perejil', 'liso', 'aliño']
    },
    {
        id: 'porro',
        name: 'Ajo Porro',
        category: 'alinos',
        priceDetal: 1.99,
        priceMayor: 1.75,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🌿',
        highlight: 'Tallo Blanco Grueso',
        tags: ['porro', 'ajo porro', 'aliño']
    },
    {
        id: 'yansin',
        name: 'Yansín / Aliño Verde',
        category: 'alinos',
        priceDetal: 1.99,
        priceMayor: 1.99,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🌿',
        highlight: 'Aliño Verde Tradicional',
        tags: ['yansin', 'aliño', 'sopa']
    },
    {
        id: 'espinaca',
        name: 'Espinaca de Hoja',
        category: 'hojas',
        priceDetal: 1.98,
        priceMayor: 1.50,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Frescura de Altura',
        tags: ['espinaca', 'hoja', 'verde']
    },
    {
        id: 'lechuga-americana',
        name: 'Lechuga Americana',
        category: 'hojas',
        priceDetal: 1.98,
        priceMayor: 0.76,
        wholesaleNote: 'Caja 10 kg ($7.60)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Caja 10 kg a $7.60',
        tags: ['lechuga', 'americana', 'ensalada']
    },
    {
        id: 'lechuga-romana',
        name: 'Lechuga Romana',
        category: 'hojas',
        priceDetal: 1.98,
        priceMayor: 0.76,
        wholesaleNote: 'Caja 10 kg ($7.60)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Caja 10 kg a $7.60',
        tags: ['lechuga', 'romana', 'cesar']
    },
    {
        id: 'lechuga-rizada',
        name: 'Lechuga Rizada',
        category: 'hojas',
        priceDetal: 1.98,
        priceMayor: 0.76,
        wholesaleNote: 'Caja 10 kg ($7.60)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Caja 10 kg a $7.60',
        tags: ['lechuga', 'rizada', 'gourmet']
    },

    // --- HORTALIZAS / VEGETALES ---
    {
        id: 'aji-dulce',
        name: 'Ají Dulce Margariteño',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 1.77,
        wholesaleNote: 'Cesta 15 kg ($26.55)',
        minWholesaleQty: 15,
        unit: 'kg',
        emoji: '🌶️',
        highlight: 'Cesta 15 kg a $26.55',
        tags: ['aji', 'aji dulce', 'sofrito']
    },
    {
        id: 'berenjena',
        name: 'Berenjena Morada',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 1.10,
        wholesaleNote: 'Cesta 18 kg ($19.80)',
        minWholesaleQty: 18,
        unit: 'kg',
        emoji: '🍆',
        highlight: 'Oferta $0.99/kg',
        tags: ['berenjena', 'morada', 'hortaliza']
    },
    {
        id: 'brocoli',
        name: 'Brócoli Verde',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 1.00,
        wholesaleNote: 'Cesta 10 ud ($10.00)',
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥦',
        highlight: 'Firme y Verde',
        tags: ['brocoli', 'hortaliza']
    },
    {
        id: 'calabacin',
        name: 'Calabacín Verde',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 0.88,
        wholesaleNote: 'Cesta 28 kg ($24.64)',
        minWholesaleQty: 28,
        unit: 'kg',
        emoji: '🥒',
        highlight: 'Cesta 28 kg a $24.64',
        tags: ['calabacin', 'zucchini']
    },
    {
        id: 'cebolla-blanca',
        name: 'Cebolla Blanca',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 1.25,
        wholesaleNote: 'Bulto 50 kg ($62.50)',
        minWholesaleQty: 50,
        unit: 'kg',
        emoji: '🧅',
        highlight: 'Bulto 50 kg a $62.50',
        tags: ['cebolla', 'blanca', 'aliño']
    },
    {
        id: 'cebolla-morada',
        name: 'Cebolla Morada',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 1.80,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🧅',
        highlight: 'Crujiente para Ensaladas',
        tags: ['cebolla', 'morada', 'aliño']
    },
    {
        id: 'coliflor',
        name: 'Coliflor Blanca',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 2.99,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥦',
        highlight: 'Firme y Blanca $1.99/kg',
        tags: ['coliflor', 'blanca']
    },
    {
        id: 'pepinillo',
        name: 'Pepinillo Fresco',
        category: 'hortalizas',
        priceDetal: 1.98,
        priceMayor: 1.98,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥒',
        highlight: 'Ideal para Encurtidos',
        tags: ['pepinillo', 'encurtido']
    },
    {
        id: 'pepino',
        name: 'Pepino Verde',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 0.70,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🥒',
        highlight: 'Fresco e Ensaladas',
        tags: ['pepino', 'ensalada']
    },
    {
        id: 'pimenton',
        name: 'Pimentón Seleccionado',
        category: 'hortalizas',
        priceDetal: 1.99,
        priceMayor: 1.75,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🫑',
        highlight: 'Color & Sabor Intenso',
        tags: ['pimenton', 'rojo', 'guiso']
    },
    {
        id: 'repollo-blanco',
        name: 'Repollo Blanco',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 0.70,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Crujiente $0.99/kg',
        tags: ['repollo', 'blanco']
    },
    {
        id: 'repollo-morado',
        name: 'Repollo Morado',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 0.67,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🟣',
        highlight: 'Colorido para Ensaladas',
        tags: ['repollo', 'morado']
    },
    {
        id: 'tomate',
        name: 'Tomate Seleccionado',
        category: 'hortalizas',
        priceDetal: 2.99,
        priceMayor: 2.08,
        wholesaleNote: 'Cesta 22 kg ($45.76)',
        minWholesaleQty: 22,
        unit: 'kg',
        emoji: '🍅',
        highlight: 'Cesta 22 kg a $45.76',
        tags: ['tomate', 'redondo', 'perita']
    },
    {
        id: 'vainita',
        name: 'Vainita Verde',
        category: 'hortalizas',
        priceDetal: 0.99,
        priceMayor: 1.70,
        minWholesaleQty: 15,
        unit: 'kg',
        emoji: '🥬',
        highlight: 'Tierna Oferta $0.99/kg',
        tags: ['vainita', 'ensalada']
    },

    // --- TUBÉRCULOS Y RAÍCES (VERDURAS) ---
    {
        id: 'apio',
        name: 'Apio Criollo',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.50,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🌿',
        highlight: 'Ideal para Sopas & Cremas',
        tags: ['apio', 'crema', 'tuberculo']
    },
    {
        id: 'auyama',
        name: 'Auyama Amarilla',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.60,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🎃',
        highlight: 'Perfecta para Sopas',
        tags: ['auyama', 'calabaza']
    },
    {
        id: 'batata',
        name: 'Batata Dulce',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.65,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Nutritiva y Dulce',
        tags: ['batata', 'tuberculo']
    },
    {
        id: 'chayota',
        name: 'Chayota Verde',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.90,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🥒',
        highlight: 'Jugosa y Rendidora',
        tags: ['chayota', 'sopa']
    },
    {
        id: 'jojoto',
        name: 'Jojoto Dulce',
        category: 'tuberculos',
        priceDetal: 1.98,
        priceMayor: 0.28,
        wholesaleNote: 'Bulto 100 ud ($28.00)',
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🌽',
        highlight: 'Jojoto Dulce por Kg',
        tags: ['jojoto', 'maiz']
    },
    {
        id: 'name',
        name: 'Ñame Criollo',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.55,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Ideal para Sancochos',
        tags: ['name', 'sopa']
    },
    {
        id: 'ocumo-blanco',
        name: 'Ocumo Blanco',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 2.00,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Rendimiento Máximo',
        tags: ['ocumo', 'blanco']
    },
    {
        id: 'ocumo-chino',
        name: 'Ocumo Chino',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.98,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Suave y Cremoso',
        tags: ['ocumo', 'chino']
    },
    {
        id: 'papa',
        name: 'Papa Lavada Premium',
        category: 'tuberculos',
        priceDetal: 2.99,
        priceMayor: 2.10,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🥔',
        highlight: 'Papa Lavada Granola',
        tags: ['papa', 'patata', 'lavada']
    },
    {
        id: 'papa-criolla',
        name: 'Papa Criolla / Amarilla',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.65,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🥔',
        highlight: 'Papita Amarilla Gourmet',
        tags: ['papa', 'criolla', 'amarilla']
    },
    {
        id: 'papa-negra',
        name: 'Papa Negra Seleccionada',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.99,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🥔',
        highlight: 'Excelente para Frituras',
        tags: ['papa', 'negra']
    },
    {
        id: 'platano-g',
        name: 'Plátano Grande',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.25,
        wholesaleNote: 'Cesta 29 kg ($36.25)',
        minWholesaleQty: 29,
        unit: 'kg',
        emoji: '🍌',
        highlight: 'Cesta 29 kg a $36.25',
        tags: ['platano', 'grande', 'tostones']
    },
    {
        id: 'platano-p',
        name: 'Plátano Pequeño',
        category: 'tuberculos',
        priceDetal: 1.99,
        priceMayor: 1.99,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🍌',
        highlight: 'Maduro o Verde',
        tags: ['platano', 'pequeño']
    },
    {
        id: 'rabano',
        name: 'Rábano Fresco',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.99,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🥕',
        highlight: 'Crujiente para Ensaladas',
        tags: ['rabano', 'ensalada']
    },
    {
        id: 'remolacha',
        name: 'Remolacha Morada',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.80,
        minWholesaleQty: 20,
        unit: 'kg',
        emoji: '🥕',
        highlight: 'Dulzura Natural',
        tags: ['remolacha', 'ensalada']
    },
    {
        id: 'topocho',
        name: 'Topocho Verde/Maduro',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.90,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Rendidor para Sopas',
        tags: ['topocho', 'sopa']
    },
    {
        id: 'yuca',
        name: 'Yuca Dulce',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 1.00,
        minWholesaleQty: 30,
        unit: 'kg',
        emoji: '🍠',
        highlight: 'Yuca Suave y Harinosa',
        tags: ['yuca', 'sancocho']
    },
    {
        id: 'zanahoria',
        name: 'Zanahoria de Altura',
        category: 'tuberculos',
        priceDetal: 0.99,
        priceMayor: 0.70,
        wholesaleNote: 'Bulto 40 kg ($28.00)',
        minWholesaleQty: 40,
        unit: 'kg',
        emoji: '🥕',
        highlight: 'Bulto 40 kg a $28.00',
        tags: ['zanahoria', 'bulto']
    },

    // --- ALIÑOS ESPECIALES ---
    {
        id: 'ajo-pelado',
        name: 'Ajo Pelado Criollo',
        category: 'alinos',
        priceDetal: 5.80,
        priceMayor: 4.50,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🧄',
        highlight: 'Listo para Cocinar $5.80/kg',
        tags: ['ajo', 'pelado', 'aliño']
    },
    {
        id: 'ajo-concha',
        name: 'Ajo Concha / Chino',
        category: 'alinos',
        priceDetal: 4.70,
        priceMayor: 4.60,
        minWholesaleQty: 10,
        unit: 'kg',
        emoji: '🧄',
        highlight: 'Dientes Grandes $4.70/kg',
        tags: ['ajo', 'concha', 'chino']
    },

];

// Exponer PRODUCTS globalmente para servicios secundarios (StockService, Supabase, Google Sheets)
window.PRODUCTS = PRODUCTS;

// --- Configuración de Estado Global ---
let TASA_BCV = 36.50; // Tasa por defecto de respaldo mientras consulta API
let isWholesaleMode = true; // Por defecto iniciado en Al Mayor para restaurantes
let activeCategory = 'all';
let searchQuery = ''; // Filtro de búsqueda de rubros
let cart = []; // Estructura: { product, qty }

// --- Inicialización al Cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Íconos Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // Consultar Tasa Oficial en Vivo (BCV / Banco de Venezuela)
    fetchOfficialExchangeRate();

    // Configurar Event Listeners principales
    setupEventListeners();

    // Renderizar catálogo inicial
    renderProducts();
    updatePricingBannerUI();
    updateCartUI();

    // Inicializar animaciones GSAP
    initGSAPAnimations();
});

// ============================================================
// SISTEMA DE TASA BCV — ACTUALIZACIÓN REAL Y DIARIA
// Usa caché localStorage para evitar peticiones innecesarias.
// Se actualiza automáticamente cada 24 horas.
// ============================================================

const BCV_CACHE_KEY = 'cafeteros_bcv_cache';
const BCV_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas en ms

/**
 * Guarda la tasa y metadatos en localStorage.
 */
function saveBcvCache(rate, dateStr) {
    try {
        localStorage.setItem(BCV_CACHE_KEY, JSON.stringify({
            rate: rate,
            dateStr: dateStr,
            savedAt: Date.now()
        }));
    } catch (e) { /* localStorage no disponible */ }
}

/**
 * Lee el caché. Retorna null si expiró o no existe.
 */
function loadBcvCache() {
    try {
        const raw = localStorage.getItem(BCV_CACHE_KEY);
        if (!raw) return null;
        const cache = JSON.parse(raw);
        const age = Date.now() - (cache.savedAt || 0);
        if (age < BCV_CACHE_TTL_MS && cache.rate && !isNaN(cache.rate)) {
            return cache;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Aplica la tasa BCV a todos los elementos de la UI.
 */
function applyBcvRateToUI(rate, dateStr, source) {
    TASA_BCV = rate;
    const formatted = `Bs ${rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $`;
    const srcLabel = source === 'cache' ? dateStr : source === 'live' ? `✦ EN VIVO · ${dateStr}` : '(Ref. BCV)';

    const rateDisplay = document.getElementById('bcv-rate-display');
    const rateDate = document.getElementById('bcv-rate-date');
    const frameBcv = document.getElementById('frame-bcv');
    const tickerBcv = document.getElementById('ticker-bcv-value');

    if (rateDisplay) rateDisplay.textContent = formatted;
    if (rateDate) {
        rateDate.textContent = srcLabel;
        rateDate.style.color = source === 'live' ? '#B7F34B' : 'rgba(255,255,255,0.55)';
    }
    if (frameBcv) frameBcv.textContent = formatted;
    if (tickerBcv) tickerBcv.textContent = formatted;

    updateCartUI();
}

/**
 * Función principal de obtención de tasa BCV en vivo.
 * Intenta múltiples fuentes con CORS abierto.
 * Con caché de 24 horas en localStorage.
 */
async function fetchOfficialExchangeRate() {
    // --- 1. Intentar servir desde caché si aún es válido ---
    const cached = loadBcvCache();
    if (cached) {
        const cacheDate = new Date(cached.savedAt);
        const dateFmt = cacheDate.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        applyBcvRateToUI(cached.rate, `(BCV ${dateFmt})`, 'cache');
        console.info(`[BCV] Usando caché: Bs ${cached.rate} — actualizado: ${dateFmt}`);

        // Aunque sirva del caché, re-intentar en background si ya pasó media jornada (12h)
        const halfTTL = BCV_CACHE_TTL_MS / 2;
        if (Date.now() - cached.savedAt > halfTTL) {
            fetchLiveBcvRate(); // en background, sin bloquear UI
        }
        return;
    }

    // --- 2. Sin caché válido: obtener en vivo ---
    const rateDate = document.getElementById('bcv-rate-date');
    if (rateDate) {
        rateDate.textContent = 'Consultando BCV...';
        rateDate.style.color = 'rgba(255,255,255,0.45)';
    }
    await fetchLiveBcvRate();
}

/**
 * Realiza la petición en vivo a las APIs externas.
 * Fuentes con CORS abierto: ve.dolarapi.com, exchangerate APIs.
 */
async function fetchLiveBcvRate() {
    // Lista de endpoints en orden de preferencia (CORS abierto verificado)
    const apiEndpoints = [
        {
            url: 'https://ve.dolarapi.com/v1/dolares/oficial',
            parse: (data) => {
                if (data && data.promedio && !isNaN(parseFloat(data.promedio))) {
                    const dateStr = data.fechaActualizacion
                        ? new Date(data.fechaActualizacion).toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' })
                        : new Date().toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' });
                    return { rate: parseFloat(data.promedio), dateStr };
                }
                return null;
            }
        },
        {
            url: 'https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv',
            parse: (data) => {
                if (data && data.monitors && data.monitors.bcv && !isNaN(parseFloat(data.monitors.bcv.price))) {
                    const dateStr = new Date().toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' });
                    return { rate: parseFloat(data.monitors.bcv.price), dateStr };
                }
                return null;
            }
        },
        {
            url: 'https://rates.dolarvzla.com/bcv/current.json',
            parse: (data) => {
                // dolarvzla.com tiene CORS abierto
                const rate = data && (data.rate || data.value || data.price || data.promedio);
                if (rate && !isNaN(parseFloat(rate))) {
                    const dateStr = new Date().toLocaleDateString('es-VE', { day:'2-digit', month:'2-digit', year:'numeric' });
                    return { rate: parseFloat(rate), dateStr };
                }
                return null;
            }
        }
    ];

    for (const endpoint of apiEndpoints) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout
            const res = await fetch(endpoint.url, {
                signal: controller.signal,
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                const parsed = endpoint.parse(data);
                if (parsed && parsed.rate > 0) {
                    saveBcvCache(parsed.rate, parsed.dateStr);
                    applyBcvRateToUI(parsed.rate, parsed.dateStr, 'live');
                    console.info(`[BCV] ✓ Tasa obtenida en vivo: Bs ${parsed.rate} (${endpoint.url})`);
                    scheduleNextBcvRefresh(); // Programar próxima actualización automática
                    return;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn(`[BCV] Fallo en ${endpoint.url}:`, err.message || err);
            }
        }
    }

    // --- Todos fallaron: usar tasa de respaldo ---
    console.warn('[BCV] No se pudo obtener tasa en vivo. Usando valor de respaldo.');
    applyBcvRateToUI(TASA_BCV, '(Sin conexión — Est.)', 'fallback');
}

/**
 * Programa la próxima actualización automática de la tasa.
 * Se activa a las 12:00 PM hora de Venezuela (UTC-4) del día siguiente,
 * ya que el BCV publica su tasa alrededor del mediodía.
 */
function scheduleNextBcvRefresh() {
    // Calcular ms hasta el próximo mediodía Venezuela (UTC-4 → UTC offset -4h)
    const nowVE = new Date(Date.now() - (4 * 60 * 60 * 1000)); // hora VE aproximada
    const nextNoon = new Date(nowVE);
    nextNoon.setUTCHours(16, 5, 0, 0); // 12:05 PM VE = 16:05 UTC
    if (nextNoon <= nowVE) {
        nextNoon.setUTCDate(nextNoon.getUTCDate() + 1); // siguiente día
    }
    const msUntilNoon = nextNoon.getTime() + (4 * 60 * 60 * 1000) - Date.now();

    if (msUntilNoon > 0 && msUntilNoon < 48 * 60 * 60 * 1000) {
        setTimeout(() => {
            console.info('[BCV] ⟳ Actualización automática programada ejecutándose...');
            fetchLiveBcvRate();
        }, msUntilNoon);
        console.info(`[BCV] Próxima actualización automática en ${Math.round(msUntilNoon / 3600000 * 10) / 10}h`);
    }
}

// --- Helper Functions de Búsqueda Avanzada & Precisión ---
function normalizeText(str) {
    if (!str) return '';
    return str.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function getSearchTokens(query) {
    const clean = normalizeText(query);
    if (!clean) return [];
    return clean.split(/\s+/).filter(t => t.length > 0);
}

function filterAndRankProducts(products, categoryFilter, query) {
    const tokens = getSearchTokens(query);

    return products.map(prod => {
        const matchesCategory = categoryFilter === 'all' || prod.category === categoryFilter;
        if (!matchesCategory) return { product: prod, score: -1 };

        if (tokens.length === 0) {
            return { product: prod, score: 0 };
        }

        const normName = normalizeText(prod.name);
        const normCategory = normalizeText(prod.category);
        const normHighlight = normalizeText(prod.highlight);
        const normUnit = normalizeText(prod.unit);
        const normTags = (prod.tags || []).map(t => normalizeText(t)).join(' ');

        const searchableText = `${normName} ${normCategory} ${normHighlight} ${normUnit} ${normTags}`;

        // Todos los términos ingresados deben estar contenidos en las propiedades del producto
        const allTokensMatch = tokens.every(token => searchableText.includes(token));
        if (!allTokensMatch) return { product: prod, score: -1 };

        // Puntuación de relevancia para el ordenamiento de mejores resultados primero
        const fullQueryNorm = normalizeText(query);
        let score = 10;

        if (normName === fullQueryNorm) score += 100;
        else if (normName.startsWith(fullQueryNorm)) score += 80;
        else if (normName.includes(fullQueryNorm)) score += 60;

        if (normTags.includes(fullQueryNorm)) score += 30;
        if (normHighlight.includes(fullQueryNorm)) score += 20;

        return { product: prod, score };
    })
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

function highlightMatches(text, query) {
    if (!text || !query || !query.trim()) return text;
    const tokens = getSearchTokens(query);
    if (tokens.length === 0) return text;

    const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regexPattern = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

    return text.replace(regexPattern, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

let selectedSuggestionIndex = -1;

function updateQuickChipCounts() {
    const quickChips = document.getElementById('quick-search-chips');
    if (!quickChips) return;

    quickChips.querySelectorAll('.search-chip').forEach(chip => {
        const term = chip.dataset.search;
        if (term) {
            const count = filterAndRankProducts(PRODUCTS, activeCategory, term).length;
            const countSpan = chip.querySelector('.chip-count');
            if (countSpan) {
                countSpan.textContent = `(${count})`;
            }
        }
    });
}

function renderSuggestionsDropdown() {
    const dropdown = document.getElementById('search-suggestions-dropdown');
    const searchInput = document.getElementById('product-search-input');
    if (!dropdown || !searchInput) return;

    const query = searchInput.value.trim();
    if (!query) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        selectedSuggestionIndex = -1;
        return;
    }

    const matches = filterAndRankProducts(PRODUCTS, 'all', query);

    if (matches.length === 0) {
        dropdown.innerHTML = `
            <div class="suggestion-no-results">
                <i data-lucide="info"></i> No hay productos que coincidan con "<strong>${escapeHtml(query)}</strong>"
            </div>
        `;
        dropdown.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
        return;
    }

    const topMatches = matches.slice(0, 5);
    selectedSuggestionIndex = -1;

    let html = `
        <div class="dropdown-header">
            <span><i data-lucide="sparkles"></i> Sugerencias Rápida</span>
            <span class="dropdown-count">${matches.length} disponible${matches.length === 1 ? '' : 's'}</span>
        </div>
        <div class="dropdown-list">
    `;

    topMatches.forEach((prod, index) => {
        const price = isWholesaleMode ? prod.priceMayor : prod.priceDetal;
        const highlightedTitle = highlightMatches(prod.name, query);
        const highlightedHighlight = highlightMatches(prod.highlight, query);

        html += `
            <div class="suggestion-item" data-index="${index}" data-id="${prod.id}">
                <span class="suggestion-emoji">${prod.emoji}</span>
                <div class="suggestion-info">
                    <div class="suggestion-title">${highlightedTitle}</div>
                    <div class="suggestion-sub">${highlightedHighlight}</div>
                </div>
                <div class="suggestion-price">
                    <span class="sugg-amount">$${price.toFixed(2)}</span>
                    <span class="sugg-unit">/${prod.unit}</span>
                </div>
                <button class="btn-suggestion-add" data-id="${prod.id}" title="Agregar ${prod.minWholesaleQty}${prod.unit} al pedido">
                    <i data-lucide="plus"></i> Agregar
                </button>
            </div>
        `;
    });

    html += `
        </div>
        <div class="dropdown-footer" id="dropdown-view-all">
            <span>Ver los <strong>${matches.length}</strong> resultados en el catálogo</span>
            <i data-lucide="arrow-right"></i>
        </div>
    `;

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();

    // Asignar eventos de clic en sugerencias
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.btn-suggestion-add')) {
                e.stopPropagation();
                const prodId = e.target.closest('.btn-suggestion-add').dataset.id;
                const prod = PRODUCTS.find(p => p.id === prodId);
                if (prod) {
                    addToCart(prod.id, isWholesaleMode ? prod.minWholesaleQty : 1);
                }
                return;
            }
            const prodId = item.dataset.id;
            const prod = PRODUCTS.find(p => p.id === prodId);
            if (prod) {
                searchQuery = prod.name;
                searchInput.value = prod.name;
                dropdown.classList.add('hidden');
                renderProducts();
            }
        });
    });

    const viewAllBtn = dropdown.querySelector('#dropdown-view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            searchQuery = query;
            dropdown.classList.add('hidden');
            renderProducts();
        });
    }
}

function handleSearchKeydown(e) {
    const dropdown = document.getElementById('search-suggestions-dropdown');
    const searchInput = document.getElementById('product-search-input');
    
    if (e.key === 'Escape') {
        if (dropdown) dropdown.classList.add('hidden');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            searchQuery = '';
            const btnClearSearch = document.getElementById('btn-clear-search');
            if (btnClearSearch) btnClearSearch.classList.add('hidden');
            renderProducts();
        }
        return;
    }

    if (!dropdown || dropdown.classList.contains('hidden')) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value;
            renderProducts();
        }
        return;
    }

    const items = dropdown.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
        updateSelectedSuggestion(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
        updateSelectedSuggestion(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
            items[selectedSuggestionIndex].click();
        } else {
            searchQuery = searchInput.value;
            dropdown.classList.add('hidden');
            renderProducts();
        }
    }
}

function updateSelectedSuggestion(items) {
    items.forEach((item, idx) => {
        if (idx === selectedSuggestionIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// --- Configuración de Event Listeners ---
function setupEventListeners() {
    // Filtros por Categoría

    // Filtros por Categoría
    const tabsContainer = document.getElementById('category-tabs');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                activeCategory = e.target.dataset.category;
                renderProducts();
            }
        });
    }

    // --- Barra de Búsqueda Interactiva Avanzada ---
    const searchInput = document.getElementById('product-search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const quickChips = document.getElementById('quick-search-chips');
    const btnResetSearch = document.getElementById('btn-reset-search');
    const noProductsSuggestions = document.getElementById('no-products-suggestions');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (btnClearSearch) {
                if (searchQuery.trim().length > 0) {
                    btnClearSearch.classList.remove('hidden');
                } else {
                    btnClearSearch.classList.add('hidden');
                }
            }
            if (quickChips) {
                quickChips.querySelectorAll('.search-chip').forEach(c => c.classList.remove('active'));
            }
            renderProducts();
            renderSuggestionsDropdown();
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                renderSuggestionsDropdown();
            }
        });

        searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    // Atajo global de teclado (Ctrl + K o /)
    document.addEventListener('keydown', (e) => {
        const isInputFocused = document.activeElement && 
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                renderSuggestionsDropdown();
            }
        } else if (e.key === '/' && !isInputFocused) {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                renderSuggestionsDropdown();
            }
        }
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.catalog-search-container');
        const dropdown = document.getElementById('search-suggestions-dropdown');
        if (searchContainer && dropdown && !searchContainer.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            searchQuery = '';
            btnClearSearch.classList.add('hidden');
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
            if (quickChips) {
                quickChips.querySelectorAll('.search-chip').forEach(c => c.classList.remove('active'));
            }
            renderProducts();
        });
    }

    if (quickChips) {
        quickChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.search-chip');
            if (chip) {
                const term = chip.dataset.search;
                const isAlreadyActive = chip.classList.contains('active');

                quickChips.querySelectorAll('.search-chip').forEach(c => c.classList.remove('active'));

                if (isAlreadyActive) {
                    searchQuery = '';
                    if (searchInput) searchInput.value = '';
                    if (btnClearSearch) btnClearSearch.classList.add('hidden');
                } else {
                    chip.classList.add('active');
                    searchQuery = term;
                    if (searchInput) searchInput.value = term;
                    if (btnClearSearch) btnClearSearch.classList.remove('hidden');
                }
                const dropdown = document.getElementById('search-suggestions-dropdown');
                if (dropdown) dropdown.classList.add('hidden');
                renderProducts();
            }
        });
    }

    if (noProductsSuggestions) {
        noProductsSuggestions.addEventListener('click', (e) => {
            const chip = e.target.closest('.search-chip');
            if (chip) {
                const term = chip.dataset.search;
                searchQuery = term;
                if (searchInput) searchInput.value = term;
                if (btnClearSearch) btnClearSearch.classList.remove('hidden');
                renderProducts();
            }
        });
    }

    if (btnResetSearch) {
        btnResetSearch.addEventListener('click', () => {
            searchQuery = '';
            activeCategory = 'all';
            if (searchInput) searchInput.value = '';
            if (btnClearSearch) btnClearSearch.classList.add('hidden');
            if (quickChips) quickChips.querySelectorAll('.search-chip').forEach(c => c.classList.remove('active'));
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (dropdown) dropdown.classList.add('hidden');

            document.querySelectorAll('.tab-btn').forEach(btn => {
                if (btn.dataset.category === 'all') btn.classList.add('active');
                else btn.classList.remove('active');
            });
            renderProducts();
        });
    }

    // Modales y Drawers
    setupModalEvents();

    // Enviar Cotización por WhatsApp
    const btnSendWhatsapp = document.getElementById('btn-send-whatsapp');
    if (btnSendWhatsapp) {
        btnSendWhatsapp.addEventListener('click', handleSendWhatsapp);
    }
}

// Interacción de Modales
function setupModalEvents() {
    // Modal Ubicación
    const locationModal = document.getElementById('location-modal');
    const btnOpenLocation = document.getElementById('btn-open-location');
    const btnHeroLocation = document.getElementById('btn-hero-location');
    const btnCloseLocation = document.getElementById('btn-close-location');
    const btnUnderstoodLocation = document.getElementById('btn-understood-location');

    const openLocation = () => locationModal.classList.add('active');
    const closeLocation = () => locationModal.classList.remove('active');

    if (btnOpenLocation) btnOpenLocation.addEventListener('click', openLocation);
    if (btnHeroLocation) btnHeroLocation.addEventListener('click', openLocation);
    if (btnCloseLocation) btnCloseLocation.addEventListener('click', closeLocation);
    if (btnUnderstoodLocation) btnUnderstoodLocation.addEventListener('click', closeLocation);

    // Cart Drawer
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const btnOpenCart = document.getElementById('btn-open-cart');
    const btnCloseCart = document.getElementById('btn-close-cart');

    const openCart = () => cartDrawerOverlay.classList.add('active');
    const closeCart = () => cartDrawerOverlay.classList.remove('active');

    if (btnOpenCart) btnOpenCart.addEventListener('click', openCart);
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);

    // Modal Gestor de Inventario (Stock Manager)
    const stockModal = document.getElementById('stock-modal');
    const btnOpenStock = document.getElementById('btn-open-stock-mgr');
    const btnCloseStock = document.getElementById('btn-close-stock');
    const btnCloseStockFoot = document.getElementById('btn-close-stock-foot');

    const openStockModal = async () => {
        if (stockModal) {
            stockModal.classList.add('active');
            await renderStockManagerModal();
        }
    };
    const closeStockModal = () => {
        if (stockModal) stockModal.classList.remove('active');
    };

    if (btnOpenStock) btnOpenStock.addEventListener('click', openStockModal);
    if (btnCloseStock) btnCloseStock.addEventListener('click', closeStockModal);
    if (btnCloseStockFoot) btnCloseStockFoot.addEventListener('click', closeStockModal);

    if (stockModal) {
        stockModal.addEventListener('click', (e) => {
            if (e.target === stockModal) closeStockModal();
        });

        // Tabs del modal de inventario
        stockModal.querySelectorAll('.stock-tab-btn').forEach(tabBtn => {
            tabBtn.addEventListener('click', (e) => {
                stockModal.querySelectorAll('.stock-tab-btn').forEach(b => b.classList.remove('active'));
                stockModal.querySelectorAll('.stock-tab-content').forEach(c => c.classList.add('hidden'));

                const targetTab = e.currentTarget.dataset.tab;
                e.currentTarget.classList.add('active');

                const targetContent = document.getElementById(`stock-tab-${targetTab}`);
                if (targetContent) targetContent.classList.remove('hidden');
            });
        });
    }

    // Suscribirse a cambios en StockService para refrescar UI automáticamente
    if (window.StockService) {
        StockService.subscribe(() => {
            renderProducts();
            if (stockModal && stockModal.classList.contains('active')) {
                renderStockManagerModal();
            }
        });
    }
}

// Renderizado del Modal Gestor de Inventario
async function renderStockManagerModal() {
    const tableBody = document.getElementById('stock-table-body');
    const logsList = document.getElementById('stock-logs-list');
    const cloudStatus = document.getElementById('stock-cloud-status');
    const warningCountEl = document.getElementById('stock-warning-count');

    if (cloudStatus && window.StockService) {
        cloudStatus.textContent = StockService.isCloudConnected ? '🟢 Cloud Supabase Realtime' : '🟡 Local Persistente';
    }

    const stockMap = await StockService.getStockData();
    let warningCount = 0;

    if (tableBody) {
        tableBody.innerHTML = '';
        PRODUCTS.forEach(prod => {
            const itemStock = stockMap[prod.id] || { stockQty: 100, minAlert: 15, status: 'disponible' };
            const isWarning = itemStock.stockQty <= itemStock.minAlert;
            if (isWarning) warningCount++;

            let statusBadge = `<span class="stock-status-badge available">Disponible</span>`;
            if (itemStock.stockQty <= 0) {
                statusBadge = `<span class="stock-status-badge empty">Agotado</span>`;
            } else if (isWarning) {
                statusBadge = `<span class="stock-status-badge warning">Poco Stock</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="display:flex; align-items:center; gap:6px;">
                        <span>${prod.emoji}</span> ${prod.name}
                    </strong>
                    <small style="color:#777;">Cat: ${prod.category} | Min Mayor: ${prod.minWholesaleQty}${prod.unit}</small>
                </td>
                <td>
                    <input type="number" class="stock-input-inline" id="stock-val-${prod.id}" value="${itemStock.stockQty}" min="0">
                    <small>${prod.unit}</small>
                </td>
                <td>${itemStock.minAlert} ${prod.unit}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-stock-save" data-id="${prod.id}">
                        Guardar
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Asignar guardado rápido de stock
        tableBody.querySelectorAll('.btn-stock-save').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const input = document.getElementById(`stock-val-${id}`);
                if (input) {
                    const newQty = parseFloat(input.value) || 0;
                    const prod = PRODUCTS.find(p => p.id === id);
                    const currentStock = stockMap[id] ? stockMap[id].stockQty : 0;
                    const diff = newQty - currentStock;

                    await StockService.updateStock(id, diff, 'ajuste', 'Ajuste manual desde Gestor', prod ? prod.name : id);
                    btn.textContent = '¡Guardado!';
                    setTimeout(() => btn.textContent = 'Guardar', 1500);
                }
            });
        });
    }

    if (warningCountEl) warningCountEl.textContent = warningCount;

    // Renderizar logs de movimiento
    if (logsList && window.StockService) {
        const logs = StockService.getMovements();
        if (logs.length === 0) {
            logsList.innerHTML = `<p style="text-align:center; color:#777; padding:20px;">No hay movimientos de stock registrados aún.</p>`;
        } else {
            logsList.innerHTML = logs.map(log => {
                const dateStr = new Date(log.date).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
                return `
                    <div class="stock-log-item">
                        <div>
                            <strong>${log.productName || log.productId}</strong>
                            <p style="margin:2px 0 0 0; color:#666; font-size:0.8rem;">${log.notes || ''} • <small>${dateStr}</small></p>
                        </div>
                        <div style="text-align:right;">
                            <span class="stock-log-tag ${log.type}">${log.type}</span>
                            <strong style="display:block; margin-top:2px;">${log.qty > 0 ? '+' : ''}${log.qty}</strong>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// Helper: Calcular Kilos Totales en el Carrito (Rubros medidos en 'kg')
function getCartTotalKg() {
    return cart.reduce((acc, item) => item.product.unit === 'kg' ? acc + item.qty : acc, 0);
}

// Actualizar banner informativo superior de forma 100% automática según los kilos del carrito
// Actualizar banner informativo superior de forma 100% automática según los kilos por rubro
function updatePricingBannerUI() {
    const banner = document.getElementById('pricing-banner');
    const modeTitle = document.getElementById('mode-title');
    const modeDesc = document.getElementById('mode-desc');
    const cartModeSubtitle = document.getElementById('cart-mode-subtitle');

    if (!banner) return;

    const wholesaleItemsCount = cart.filter(item => item.qty >= 30).length;

    if (wholesaleItemsCount > 0) {
        banner.classList.remove('detal-mode');
        banner.classList.add('wholesale-active');
        if (modeTitle) modeTitle.innerHTML = `✨ ¡${wholesaleItemsCount} Rubro(s) con Tarifa Al Mayor en tu Cotización!`;
        if (modeDesc) modeDesc.innerHTML = `Los rubros donde alcances <strong>30 kg o más individualmente</strong> obtienen el precio preferencial al mayor.`;
        if (cartModeSubtitle) cartModeSubtitle.textContent = 'Modo: Cotización con Descuento Al Mayor por Rubro (30+ kg)';
    } else {
        banner.classList.add('detal-mode');
        banner.classList.remove('wholesale-active');
        if (modeTitle) modeTitle.innerHTML = 'Precios Al Mayor a partir de 30 kg por Rubro';
        if (modeDesc) modeDesc.innerHTML = `Solicita <strong>30 kg o más de un mismo producto</strong> en tu cotización para aplicar su tarifa especial al mayor.`;
        if (cartModeSubtitle) cartModeSubtitle.textContent = 'Modo: Tarifa Al Detal';
    }
}

// --- Renderizado del Catálogo de Productos e Inventario ---
async function renderProducts() {
    const grid = document.getElementById('products-grid');
    const noProductsMsg = document.getElementById('no-products-msg');
    const noProductsQuery = document.getElementById('no-products-query');
    const searchCountBadge = document.getElementById('search-count-badge');

    if (!grid) return;

    grid.innerHTML = '';

    // Consultar datos de stock actualizados vía StockService (Supabase o Local)
    const stockMap = await StockService.getStockData();

    // Filtrar y ordenar por relevancia con algoritmo multi-término y diacríticos
    const filtered = filterAndRankProducts(PRODUCTS, activeCategory, searchQuery);

    // Calcular estado global al mayor (30 kg acumulados)
    const totalKgInCart = getCartTotalKg();
    const isAutoWholesaleActive = totalKgInCart >= 30;

    // Actualizar Banner Informativo
    updatePricingBannerUI();

    // Actualizar badges y contadores de chips
    if (searchCountBadge) {
        if (searchQuery.trim().length > 0 || activeCategory !== 'all') {
            searchCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'rubro' : 'rubros'}`;
            searchCountBadge.classList.remove('hidden');
        } else {
            searchCountBadge.classList.add('hidden');
        }
    }

    updateQuickChipCounts();

    // Mostrar u ocultar mensaje de sin resultados
    if (noProductsMsg) {
        if (filtered.length === 0) {
            noProductsMsg.classList.remove('hidden');
            if (noProductsQuery) noProductsQuery.textContent = searchQuery || 'la categoría elegida';
        } else {
            noProductsMsg.classList.add('hidden');
        }
    }

    filtered.forEach(prod => {
        const savingPercent = Math.round(((prod.priceDetal - prod.priceMayor) / prod.priceDetal) * 100);

        // Obtener estado de stock dinámico
        const itemStock = stockMap[prod.id] || { stockQty: 100, minAlert: 15, status: 'disponible' };
        const availableQty = itemStock.stockQty;
        const isOutOfStock = availableQty <= 0;
        const isLowStock = !isOutOfStock && availableQty <= itemStock.minAlert;

        // 🔴 Evaluar si ESTE rubro específico alcanza 30 kg o más en el carrito
        const cartItem = cart.find(i => i.product.id === prod.id);
        const isItemWholesaleActive = cartItem ? cartItem.qty >= 30 : false;
        const currentPrice = isItemWholesaleActive ? prod.priceMayor : prod.priceDetal;

        // Renderizado del badge de stock B2B
        let stockBadgeHtml = '';
        if (isOutOfStock) {
            stockBadgeHtml = `<span class="stock-status-badge empty"><i data-lucide="x-circle"></i> Agotado / Bajo Pedido</span>`;
        } else if (isLowStock) {
            stockBadgeHtml = `<span class="stock-status-badge warning"><i data-lucide="alert-triangle"></i> ¡Últimas ${availableQty} ${prod.unit}!</span>`;
        } else {
            stockBadgeHtml = `<span class="stock-status-badge available"><i data-lucide="check-circle-2"></i> Disponible para Despacho</span>`;
        }

        // Resaltar coincidencias en el nombre y en la etiqueta destacada
        const titleHtml = highlightMatches(prod.name, searchQuery);
        const highlightHtml = highlightMatches(prod.highlight, searchQuery);

        const defaultQty = isOutOfStock ? 0 : 1;

        const card = document.createElement('div');
        card.className = `product-card ${isOutOfStock ? 'is-out-of-stock' : ''} ${isItemWholesaleActive ? 'wholesale-card-active' : ''}`;
        card.innerHTML = `
            <div class="product-image-container">
                ${stockBadgeHtml}
                <span class="badge-wholesale-tier">
                    ${isItemWholesaleActive 
                        ? `✨ PRECIO MAYOR ACTIVO (30+ ${prod.unit})` 
                        : `Al Mayor (30+ ${prod.unit}): -$${(prod.priceDetal - prod.priceMayor).toFixed(2)} (${savingPercent}% OFF)`}
                </span>
                <div class="product-emoji">${prod.emoji}</div>
            </div>
            <div class="product-details">
                <span class="product-category-tag">${highlightHtml}</span>
                <h3 class="product-title">${titleHtml}</h3>
                
                <div class="product-prices">
                    <div class="price-main">
                        <span class="price-amount" style="${isItemWholesaleActive ? 'color:var(--verde-hoja); font-weight:800;' : ''}">$${currentPrice.toFixed(2)}</span>
                        <span class="price-unit">/ ${prod.unit} ${isItemWholesaleActive ? '(Al Mayor)' : '(Detal)'}</span>
                    </div>
                    <div class="price-comparison">
                        ${isItemWholesaleActive
                            ? `Detal normal: <s>$${prod.priceDetal.toFixed(2)}</s> <span class="price-saving">(-${savingPercent}% ahorro)</span>`
                            : `Al Mayor (a partir de 30 ${prod.unit} de este rubro): <strong style="color:var(--verde-hoja); font-weight:800;">$${prod.priceMayor.toFixed(2)}</strong>`}
                    </div>
                </div>

                <div class="product-actions">
                    <div class="quantity-control">
                        <button class="btn-qty btn-minus" data-id="${prod.id}" ${isOutOfStock ? 'disabled' : ''}>-</button>
                        <input type="number" class="qty-input" id="qty-input-${prod.id}" value="${defaultQty}" min="1" max="${availableQty}" step="1" ${isOutOfStock ? 'disabled' : ''}>
                        <button class="btn-qty btn-plus" data-id="${prod.id}" ${isOutOfStock ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="btn btn-add-cart" data-id="${prod.id}" ${isOutOfStock ? 'disabled' : ''}>
                        <i data-lucide="${isOutOfStock ? 'slash' : 'plus'}"></i> ${isOutOfStock ? 'Agotado' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    // Re-inicializar íconos Lucide dentro de las tarjetas
    if (window.lucide) lucide.createIcons();

    // Asignar eventos de botones de cantidad y agregar
    grid.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = e.currentTarget.dataset.id;
            const input = document.getElementById(`qty-input-${prodId}`);
            if (input && parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });

    grid.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = e.currentTarget.dataset.id;
            const input = document.getElementById(`qty-input-${prodId}`);
            if (input) {
                const max = parseInt(input.getAttribute('max')) || 999;
                const current = parseInt(input.value) || 1;
                if (current < max) {
                    input.value = current + 1;
                }
            }
        });
    });

    grid.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = e.currentTarget.dataset.id;
            const input = document.getElementById(`qty-input-${prodId}`);
            const qty = input ? parseInt(input.value) || 1 : 1;
            addToCart(prodId, qty);
        });
    });

    // Add editorial item numbers to cards
    grid.querySelectorAll('.product-card').forEach((card, idx) => {
        if (!card.querySelector('.product-card-num')) {
            const numEl = document.createElement('span');
            numEl.className = 'product-card-num';
            numEl.textContent = `#${String(idx + 1).padStart(2, '0')}`;
            const imgContainer = card.querySelector('.product-image-container');
            if (imgContainer) imgContainer.insertBefore(numEl, imgContainer.firstChild);
        }
    });

    // Trigger GSAP card entrance animations
    animateProductCards();
}

// --- Lógica del Carrito / Cotizador ---

// --- Lógica del Carrito / Cotizador e Inventario ---

async function addToCart(productId, qty) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Verificar stock físico disponible
    const stockMap = await StockService.getStockData();
    const itemStock = stockMap[productId] || { stockQty: 100 };
    const available = itemStock.stockQty;

    const existingIndex = cart.findIndex(item => item.product.id === productId);
    const currentCartQty = existingIndex > -1 ? cart[existingIndex].qty : 0;
    const requestedTotal = currentCartQty + qty;

    if (available <= 0) {
        alert(`El rubro "${product.name}" está agotado en este momento.`);
        return;
    }

    if (requestedTotal > available) {
        alert(`Atención: Solo quedan ${available} ${product.unit} de "${product.name}" disponibles en inventario.`);
        if (existingIndex > -1) {
            cart[existingIndex].qty = available;
        } else {
            cart.push({ product, qty: available });
        }
    } else {
        if (existingIndex > -1) {
            cart[existingIndex].qty = requestedTotal;
        } else {
            cart.push({ product, qty });
        }
    }

    updateCartUI();

    // Animación feedback al botón del header
    const btnOpenCart = document.getElementById('btn-open-cart');
    if (btnOpenCart) {
        btnOpenCart.style.transform = 'scale(1.1)';
        setTimeout(() => btnOpenCart.style.transform = 'scale(1)', 200);
    }
}

function updateCartQty(productId, newQty) {
    const item = cart.find(i => i.product.id === productId);
    if (item) {
        if (newQty <= 0) {
            removeFromCart(productId);
        } else {
            item.qty = newQty;
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartUI();
}

// Actualizar la vista completa del carrito con regla automática de 30 kg
function updateCartUI() {
    const cartCountEl = document.getElementById('cart-count');
    const itemsListEl = document.getElementById('cart-items-list');
    const emptyViewEl = document.getElementById('empty-cart-view');
    const formSection = document.getElementById('restaurant-form');
    const summaryItemsCount = document.getElementById('summary-items-count');
    const summaryTotalUsd = document.getElementById('summary-total-usd');
    const summaryTotalBs = document.getElementById('summary-total-bs');
    const cartWholesaleStatus = document.getElementById('cart-wholesale-status');
    const wholesaleStatusText = document.getElementById('wholesale-status-text');

    // Elementos de la Barra Informativa de 30 kg por Rubro
    const progressBox = document.getElementById('cart-wholesale-progress-box');
    const progressKgVal = document.getElementById('progress-kg-val');
    const progressPercentVal = document.getElementById('progress-percent-val');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStatusMsg = document.getElementById('progress-status-msg');

    // Contar cuántos rubros individuales superan o alcanzan los 30 kg/unid
    const wholesaleItemsCount = cart.filter(item => item.qty >= 30).length;
    const maxProductQty = cart.reduce((max, item) => Math.max(max, item.qty), 0);

    // Actualizar Barra de Progreso Informativa (30 kg por Rubro)
    if (progressBox) {
        const percent = Math.min(100, Math.round((maxProductQty / 30) * 100));
        if (progressKgVal) progressKgVal.textContent = `Mayor a partir de 30 kg/unid por rubro`;
        if (progressPercentVal) progressPercentVal.textContent = `${wholesaleItemsCount} con Tarifa Mayor`;
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;

        if (wholesaleItemsCount > 0) {
            progressBox.classList.add('active-tier');
            if (progressStatusMsg) {
                progressStatusMsg.innerHTML = `✨ <strong>Tienes ${wholesaleItemsCount} de ${cart.length} rubro(s) con Tarifa Al Mayor</strong> (alcanzaron 30 kg/unid individualmente).`;
            }
        } else {
            progressBox.classList.remove('active-tier');
            if (progressStatusMsg) {
                progressStatusMsg.innerHTML = `💡 Cada rubro o producto requiere <strong>30 kg o más individualmente</strong> para activar su precio al mayor.`;
            }
        }
    }

    // Actualizar Contador en Header
    const totalItemsCount = cart.reduce((acc, item) => acc + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = cart.length;

    if (cart.length === 0) {
        if (itemsListEl) itemsListEl.innerHTML = '';
        if (emptyViewEl) emptyViewEl.classList.remove('hidden');
        if (formSection) formSection.classList.add('hidden');
        if (summaryItemsCount) summaryItemsCount.textContent = '0 rubros';
        if (summaryTotalUsd) summaryTotalUsd.textContent = '$0.00';
        if (summaryTotalBs) summaryTotalBs.textContent = 'Bs 0.00';
        if (cartWholesaleStatus) cartWholesaleStatus.classList.add('hidden');
        return;
    }

    if (emptyViewEl) emptyViewEl.classList.add('hidden');
    if (formSection) formSection.classList.remove('hidden');
    if (cartWholesaleStatus) cartWholesaleStatus.classList.remove('hidden');

    let totalUsd = 0;
    let wholesaleQualifyingItems = 0;

    itemsListEl.innerHTML = '';

    cart.forEach(item => {
        const prod = item.product;
        // 🔴 Regla INDIVIDUAL por Rubro: Tarifa Al Mayor ÚNICAMENTE si ESTE rubro específico alcanza 30 kg/unid o más
        const isEligibleWholesale = item.qty >= 30;
        const unitPrice = isEligibleWholesale ? prod.priceMayor : prod.priceDetal;
        const subtotal = unitPrice * item.qty;
        totalUsd += subtotal;

        if (isEligibleWholesale) wholesaleQualifyingItems++;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div class="item-emoji">${prod.emoji}</div>
            <div class="item-info">
                <div class="item-name">${prod.name}</div>
                <div class="item-price-rate">
                    $${unitPrice.toFixed(2)} / ${prod.unit}
                    ${isEligibleWholesale ? '<span style="color:var(--verde-hoja-dark); font-weight:800; font-size:0.75rem;"> (Tarifa Mayor)</span>' : ''}
                </div>
            </div>
            <input type="number" class="item-qty-input" value="${item.qty}" min="1" data-id="${prod.id}">
            <div class="item-subtotal">$${subtotal.toFixed(2)}</div>
            <button class="btn-remove-item" data-id="${prod.id}"><i data-lucide="trash-2"></i></button>
        `;

        itemsListEl.appendChild(row);
    });

    // Event listeners para inputs dentro del carrito
    itemsListEl.querySelectorAll('.item-qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const prodId = e.currentTarget.dataset.id;
            const newQty = parseInt(e.currentTarget.value) || 1;
            updateCartQty(prodId, newQty);
        });
    });

    itemsListEl.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = e.currentTarget.dataset.id;
            removeFromCart(prodId);
        });
    });

    if (window.lucide) lucide.createIcons();

    // Actualizar Totales
    const totalBs = totalUsd * TASA_BCV;
    if (summaryItemsCount) summaryItemsCount.textContent = `${cart.length} rubro(s) (${totalItemsCount} ${cart.length === 1 ? 'unidad' : 'unidades'})`;
    if (summaryTotalUsd) summaryTotalUsd.textContent = `$${totalUsd.toFixed(2)}`;
    if (summaryTotalBs) summaryTotalBs.textContent = `Bs ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Banner de estado al mayor en el carrito
    if (wholesaleStatusText) {
        if (wholesaleQualifyingItems > 0 && wholesaleQualifyingItems === cart.length) {
            wholesaleStatusText.innerHTML = '✨ <strong>¡Tarifa especial Al Mayor aplicada!</strong> Todos tus rubros disfrutan del descuento al mayor (30+ kg).';
        } else if (wholesaleQualifyingItems > 0) {
            wholesaleStatusText.innerHTML = `✨ Tienes <strong>${wholesaleQualifyingItems} de ${cart.length}</strong> rubros con tarifa Al Mayor (30+ kg).`;
        } else {
            wholesaleStatusText.innerHTML = `💡 Cada rubro o producto requiere <strong>30 kg o más individualmente</strong> para activar su precio al mayor.`;
        }
    }
}

// --- Generador de Mensaje y Envío a WhatsApp con Descuento de Stock ---
async function handleSendWhatsapp() {
    if (cart.length === 0) {
        alert('Por favor agrega al menos un producto a la cotización.');
        return;
    }

    const restName = document.getElementById('input-restaurant-name').value.trim();
    const rif = document.getElementById('input-rif').value.trim();
    const zone = document.getElementById('input-zone').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    const notes = document.getElementById('input-notes').value.trim();

    if (!restName || !zone) {
        alert('Por favor completa el Nombre del Restaurante/Cliente y la Zona de Entrega en Caracas.');
        return;
    }

    // Descontar inventario y registrar movimiento en tiempo real
    if (window.StockService) {
        await StockService.processCartOrder(cart);
    }

    let totalUsd = 0;
    let itemsText = '';

    cart.forEach(item => {
        const prod = item.product;
        const isEligibleWholesale = item.qty >= 30;
        const unitPrice = isEligibleWholesale ? prod.priceMayor : prod.priceDetal;
        const subtotal = unitPrice * item.qty;
        totalUsd += subtotal;

        itemsText += `• ${prod.name}: ${item.qty} ${prod.unit} x $${unitPrice.toFixed(2)} = *$${subtotal.toFixed(2)}* ${isEligibleWholesale ? '🌟 (Al Mayor)' : ''}\n`;
    });

    const totalBs = totalUsd * TASA_BCV;

    // Armar mensaje con formato Markdown para WhatsApp
    let message = `🥦 *COTIZACIÓN DE PEDIDO - FERIA LOS CAFETEROS CARACAS* 🥦\n\n`;
    message += `👤 *Cliente/Restaurante:* ${restName}\n`;
    if (rif) message += `🪪 *RIF/Cédula:* ${rif}\n`;
    message += `📍 *Zona de Entrega (Caracas):* ${zone}\n`;
    if (phone) message += `📞 *Teléfono:* ${phone}\n`;
    message += `🏷️ *Modalidad de Compra:* ${isWholesaleMode ? 'Atención Restaurante (Al Mayor)' : 'Venta Al Detal'}\n`;
    message += `-----------------------------------------\n`;
    message += `📦 *DETALLE DEL PEDIDO:* \n\n${itemsText}\n`;
    message += `-----------------------------------------\n`;
    message += `💰 *TOTAL ESTIMADO (USD):* *$${totalUsd.toFixed(2)}*\n`;
    message += `🇻🇪 *REF. EN BOLÍVARES (BCV Est.):* *Bs ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n`;
    if (notes) message += `📝 *Observaciones:* ${notes}\n\n`;
    message += `_Mensaje generado automáticamente desde la web de LOS CAFETEROS._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/584247087749?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}
