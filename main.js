import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Optional: Add GLTFLoader if you want to load custom models later
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Basic Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark grey background

const camera = new THREE.PerspectiveCamera(
    75, // Field of View
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.z = 5; // Move camera back slightly

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true // Smoother edges
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Improve sharpness on high DPI displays

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
// Optional: Add a light helper
// const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
// scene.add(lightHelper);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // Prevent panning up/down when orbiting
controls.minDistance = 2;
controls.maxDistance = 15;
// controls.maxPolarAngle = Math.PI / 2; // Limit looking straight down

// --- Portfolio Data ---
// Define your projects/items here
// Add relevant data like title, description, link, maybe an image URL for later use
const portfolioItems = [
    {
        id: 'project1',
        title: 'Project Alpha',
        description: 'A revolutionary web application built with React and Node.js. Focused on real-time collaboration.',
        link: '#', // Replace with actual link
        position: new THREE.Vector3(-2, 0, 0),
        color: 0xff0000 // Red
    },
    {
        id: 'skill1',
        title: 'Three.js Expertise',
        description: 'Proficient in creating interactive 3D web experiences using Three.js, including models, lighting, and interactions.',
        link: '#',
        position: new THREE.Vector3(0, 1.5, -1),
        color: 0x00ff00 // Green
    },
    {
        id: 'project2',
        title: 'Data Visualization Dashboard',
        description: 'An interactive dashboard displaying complex datasets using D3.js and Vanilla JavaScript.',
        link: '#',
        position: new THREE.Vector3(2, 0, 0),
        color: 0x0000ff // Blue
    },
    {
        id: 'contact',
        title: 'Get In Touch',
        description: 'Interested in collaborating or learning more? Feel free to reach out!',
        link: 'mailto:your.email@example.com', // Replace with your email
        position: new THREE.Vector3(0, -1.5, 1),
        color: 0xffff00 // Yellow
    }
];

// --- Create 3D Objects ---
const interactableObjects = []; // Array to hold meshes we can click on

portfolioItems.forEach(item => {
    let geometry;
    // Use different shapes for variety
    if (item.id.includes('project')) {
        geometry = new THREE.BoxGeometry(1, 1, 1);
    } else if (item.id.includes('skill')) {
        geometry = new THREE.SphereGeometry(0.6, 32, 16);
    } else {
        geometry = new THREE.ConeGeometry(0.6, 1.2, 32); // Example: Cone for contact
    }

    const material = new THREE.MeshStandardMaterial({
        color: item.color,
        metalness: 0.3, // Add some metallic look
        roughness: 0.6  // Control shininess
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(item.position);

    // CRITICAL: Attach portfolio data to the mesh's userData
    mesh.userData = item;

    scene.add(mesh);
    interactableObjects.push(mesh);
});

// --- Raycasting for Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null; // Keep track of the currently selected object

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        // An interactable object was clicked
        const clickedObject = intersects[0].object;

        // If it's a new object, show its info
        if (selectedObject !== clickedObject) {
            selectedObject = clickedObject;
            showInfoPanel(selectedObject.userData);

            // Optional: Add visual feedback (e.g., slight scale up or emissive color)
            // Make sure to reset other objects if you do this
            interactableObjects.forEach(obj => {
                if (obj === selectedObject) {
                    obj.material.emissive.setHex(0x555555); // Highlight
                } else {
                    obj.material.emissive.setHex(0x000000); // Reset others
                }
            });
        }
    } else {
        // Clicked on the background, hide info panel
        if (selectedObject) { // Only hide if something was selected
            hideInfoPanel();
             // Optional: Reset visual feedback
            interactableObjects.forEach(obj => obj.material.emissive.setHex(0x000000));
            selectedObject = null;
        }
    }
}

// --- Information Panel Logic ---
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');
const infoLink = document.getElementById('info-link');
const closeButton = document.getElementById('close-btn');

function showInfoPanel(data) {
    infoTitle.textContent = data.title;
    infoDescription.textContent = data.description;
    if (data.link && data.link !== '#') {
        infoLink.href = data.link;
        infoLink.style.display = 'inline-block'; // Show link if available
        if (data.link.startsWith('mailto:')) {
             infoLink.textContent = 'Send Email';
        } else {
             infoLink.textContent = 'Learn More';
        }
    } else {
        infoLink.style.display = 'none'; // Hide link if not available
    }
    infoPanel.classList.add('visible');
}

function hideInfoPanel() {
    infoPanel.classList.remove('visible');
     // Reset selected object visual state if panel is closed via button
    if (selectedObject) {
        selectedObject.material.emissive.setHex(0x000000);
        selectedObject = null; // Ensure selection is cleared
    }
}

// Event listener for clicks
window.addEventListener('click', onMouseClick);

// Event listener for the close button
closeButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the window
    hideInfoPanel();
});

// --- Responsiveness ---
function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Re-apply pixel ratio
}
window.addEventListener('resize', onWindowResize);

// --- Loading Manager & Screen ---
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');

loadingManager.onLoad = () => {
    console.log('All assets loaded');
    loadingScreen.classList.add('fade-out');
    // Remove loading screen from DOM after transition
    loadingScreen.addEventListener('transitionend', (e) => {
        if (e.target === loadingScreen) { // Ensure it's the loading screen itself
             loadingScreen.remove();
        }
    });
    // Start animation loop ONLY after loading is complete
    animate();
};

loadingManager.onError = (url) => {
    console.error(`There was an error loading ${url}`);
    loadingScreen.textContent = 'Error loading assets. Please refresh.';
};

// If you were loading models/textures, you'd pass the manager to the loaders:
// const gltfLoader = new GLTFLoader(loadingManager);
// const textureLoader = new THREE.TextureLoader(loadingManager);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate); // Loop

    // Update controls
    controls.update();

    // Optional: Add subtle rotation to objects
    interactableObjects.forEach(obj => {
        obj.rotation.y += 0.005;
        // obj.rotation.x += 0.002; // Add more complex rotation if desired
    });

    // Render the scene
    renderer.render(scene, camera);
}

// --- Start ---
// Since we aren't loading external assets *in this basic example*,
// we can manually trigger the onLoad behavior. If you add loaders,
// the manager will handle this automatically.
if (!loadingManager.isLoading) {
    loadingManager.onLoad(); // Manually trigger if no loaders are used
}
// Don't call animate() here directly; let the loadingManager trigger it.
