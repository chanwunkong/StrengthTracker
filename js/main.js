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
                    bodyFat: 20,
                    wrist: 15,
                    ankle: 20
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
    const genderButtons = document.querySelectorAll('[data-name="gender"]');
    const genderInput = document.getElementById('gender');
    const genderDisplay = document.getElementById('genderDisplay');

    const heightSlider = document.getElementById('height');
    const heightValue = document.getElementById('heightValue');

    const weightSlider = document.getElementById('weight');
    const weightValue = document.getElementById('weightValue');

    const bodyFatSlider = document.getElementById('bodyFat');
    const bodyFatValue = document.getElementById('bodyFatValue');

    const wristSlider = document.getElementById('wrist');
    const wristValue = document.getElementById('wristValue');

    const ankleSlider = document.getElementById('ankle');
    const ankleValue = document.getElementById('ankleValue');

    // 性別
    genderInput.value = data.gender;
    genderDisplay.textContent = data.gender;

    genderButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-value') === data.gender) {
            btn.classList.add('active');
        }
    });

    // 身高
    heightSlider.value = data.height;
    heightValue.textContent = parseFloat(data.height).toFixed(1);

    // 體重
    weightSlider.value = data.weight;
    weightValue.textContent = parseFloat(data.weight).toFixed(1);

    // 體脂
    bodyFatSlider.value = data.bodyFat;
    bodyFatValue.textContent = parseFloat(data.bodyFat).toFixed(1);

    // 手腕圍
    wristSlider.value = data.wrist;
    wristValue.textContent = parseFloat(data.wrist).toFixed(1);

    // 踝圍
    ankleSlider.value = data.ankle;
    ankleValue.textContent = parseFloat(data.ankle).toFixed(1);

    // 同步圖表
    if (window.syncSliderValues) {
        window.syncSliderValues();
    }
    if (window.updateMuscleLimitChart) {
        window.updateMuscleLimitChart();
    }
}

// 👉 儲存資料
window.saveUserData = async function () {
    const user = auth.currentUser;
    if (!user) {
        alert('請先登入！');
        return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    // 取得最新表單資料
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value);
    const wrist = parseFloat(document.getElementById('wrist').value);
    const ankle = parseFloat(document.getElementById('ankle').value);

    const userData = { gender, height, weight, bodyFat, wrist, ankle };

    try {
        await setDoc(userDocRef, userData);
        updateUserInfo(userData); // 儲存後立即更新畫面
        alert('資料已成功儲存！');
    } catch (error) {
        console.error('儲存失敗：', error);
        alert('資料儲存失敗，請稍後再試。');
    }
}

// 👉 性別與其他選項按鈕選取事件
window.selectRadioButton = function (button) {
    const group = button.parentElement;
    const buttons = group.querySelectorAll('.radio-button');

    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const dataName = button.getAttribute('data-name'); // e.g. gender
    const dataValue = button.getAttribute('data-value'); // e.g. 男 or 女

    document.getElementById(dataName).value = dataValue;

    // 更新顯示文字
    if (dataName === 'gender') {
        document.getElementById('genderDisplay').textContent = dataValue;
    } else if (dataName === 'goalType') {
        document.getElementById('goalTypeDisplay').textContent = dataValue;
    }
}
