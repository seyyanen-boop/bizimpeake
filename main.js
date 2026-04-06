// --- 1. SAHNE, KAMERA VE RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcedce0); // Dağ havası rengi
scene.fog = new THREE.FogExp2(0xcedce0, 0.02); // Puslu atmosfer

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- 2. IŞIKLANDIRMA (Eller net görünsün diye) ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Genel aydınlatma
scene.add(ambientLight);

const playerLight = new THREE.PointLight(0xffffff, 1);
camera.add(playerLight); // Işık kameraya bağlı, eller hep aydınlık kalır
scene.add(camera);

// --- 3. EL MODELİNİ YÜKLEME VE SABİTLEME ---
const loader = new THREE.GLTFLoader();
let playerModel;

loader.load('assets/el.glb', function(gltf) {
    playerModel = gltf.scene;
    
    // MODEL BOYUTU: Minicik kalmaması için 10 kat büyüttük
    playerModel.scale.set(10.0, 10.0, 10.0); 
    
    // MODEL KONUMU: Tam karşımızda ve biraz aşağıda durması için
    playerModel.position.set(0, -1.5, -2.0); 
    
    // MODEL AÇISI: Eğer eller sana bakmıyorsa burayı 0, Math.PI, veya Math.PI/2 yap
    playerModel.rotation.y = Math.PI; 

    camera.add(playerModel); // ELİ KAMERAYA BAĞLADIK (Dönme bitti, sabitlendi)
    console.log("El modeli başarıyla kameraya bağlandı!");
}, undefined, function(error) {
    console.error("Model yüklenirken hata oluştu! Dosya adını kontrol et.");
});

// --- 4. DAĞ VE TIRMANIŞ BLOKLARI ---
const rockGeo = new THREE.BoxGeometry(2, 5, 2);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

for(let i = 0; i < 30; i++) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    // Kayaları tırmanış rotası şeklinde diziyoruz
    rock.position.set(Math.sin(i) * 1.5, i * 4, -4);
    rock.receiveShadow = true;
    scene.add(rock);
}

// --- 5. KONTROLLER VE DEĞİŞKENLER ---
let stamina = 100;
const keys = {};
window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

// --- 6. OYUN DÖNGÜSÜ (ANİMASYON) ---
function animate() {
    requestAnimationFrame(animate);

    // TIRMANIŞ MEKANİĞİ
    if (keys['w'] && stamina > 0) {
        camera.position.y += 0.05; // Yukarı hızı
        stamina -= 0.12; // Enerji tüketimi
        
        // Efor Sarsıntısı (Kamerayı titretir)
        camera.position.x = Math.sin(Date.now() * 0.005) * 0.02;
        
        // El Sallanma Efekti (Tırmanma hissi)
        if (playerModel) {
            playerModel.position.y = -1.5 + Math.sin(Date.now() * 0.01) * 0.05;
        }
    } else {
        // YERÇEKİMİ VE DİNLENME
        if (camera.position.y > 0) {
            camera.position.y -= 0.02; // Yavaşça aşağı kayış
        }
        if (stamina < 100) stamina += 0.3; // Enerji dolar
    }

    // ARAYÜZ GÜNCELLEME (Yeşil Bar)
    const staminaBar = document.getElementById('stamina-bar');
    if (staminaBar) {
        staminaBar.style.width = stamina + "%";
        staminaBar.style.backgroundColor = stamina < 30 ? "#ff4d4d" : "#a4e61b";
    }

    renderer.render(scene, camera);
}

// Ekran boyutunu otomatik ayarla
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();