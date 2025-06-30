// main.js
import {
    auth,
    db,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc
} from './firebase.js';

import { setupUI } from './ui.js';
import { setupForm } from './form.js';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const welcomeMsg = document.getElementById('welcomeMsg');

// 初始化 UI 和表單
setupUI();
setupForm(auth);

// Google 登入
loginBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => console.log('登入成功', result.user))
        .catch((error) => console.error('登入錯誤：', error.message));
});

// Google 登出
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// 監聽登入狀態
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userInfo.style.display = 'block';
        welcomeMsg.textContent = `歡迎，${user.displayName}`;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                updateUserInfo(data);
            } else {
                const defaultData = {
                    gender: '男',
                    height: 170,
                    weight: 70,
                    bodyFat: 20
                };
                await setDoc(userDocRef, defaultData);
                updateUserInfo(defaultData);
            }
        } catch (error) {
            console.error('讀取錯誤：', error);
        }

    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        userInfo.style.display = 'none';
    }
});

function updateUserInfo(data) {
    const genderButtons = document.querySelectorAll('.gender-btn');
    const genderInput = document.getElementById('gender');
    const genderDisplay = document.getElementById('genderDisplay');

    const heightSlider = document.getElementById('height');
    const heightValue = document.getElementById('heightValue');

    const weightSlider = document.getElementById('weight');
    const weightValue = document.getElementById('weightValue');

    const bodyFatSlider = document.getElementById('bodyFat');
    const bodyFatValue = document.getElementById('bodyFatValue');

    genderInput.value = data.gender;
    genderDisplay.textContent = data.gender;

    genderButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-gender') === data.gender) {
            btn.classList.add('active');
        }
    });

    heightSlider.value = data.height;
    heightValue.textContent = data.height;

    weightSlider.value = data.weight;
    weightValue.textContent = data.weight;

    bodyFatSlider.value = data.bodyFat;
    bodyFatValue.textContent = data.bodyFat;
}
