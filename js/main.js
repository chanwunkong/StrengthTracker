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

            let data;
            if (userDoc.exists()) {
                data = userDoc.data();
            } else {
                data = {
                    gender: '男',
                    height: 170,
                    weight: 70,
                    bodyFat: 20,
                    wrist: 15,
                    ankle: 20,
                    records: {}
                };
                await setDoc(userDocRef, data);
            }

            // 更新使用者基本資訊
            updateUserInfo(data);

            // ⚠️ 等資料載入完再設定今天的日期並觸發載入
            const today = new Date().toISOString().split('T')[0];
            const recordDateInput = document.getElementById('recordDate');
            recordDateInput.value = today;
            recordDateInput.dispatchEvent(new Event('change'));

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

    // 身高、手腕、踝圍（這些與紀錄無關，直接設定）
    heightSlider.value = data.height;
    heightValue.textContent = parseFloat(data.height).toFixed(1);

    wristSlider.value = data.wrist;
    wristValue.textContent = parseFloat(data.wrist).toFixed(1);

    ankleSlider.value = data.ankle;
    ankleValue.textContent = parseFloat(data.ankle).toFixed(1);

    // 🔽 自動載入最近一筆紀錄（體重/體脂）
    const records = data.records || {};
    const dateList = Object.keys(records).sort(); // 升冪排列日期
    const latestDate = dateList[dateList.length - 1];

    if (latestDate) {
        const latest = records[latestDate];
        const recordDateInput = document.getElementById('recordDate');
        recordDateInput.value = latestDate;

        weightSlider.value = latest.weight;
        weightValue.textContent = parseFloat(latest.weight).toFixed(1);

        bodyFatSlider.value = latest.bodyFat;
        bodyFatValue.textContent = parseFloat(latest.bodyFat).toFixed(1);
    } else {
        // 如果沒有紀錄，設為預設值
        weightSlider.value = 70;
        weightValue.textContent = '70.0';

        bodyFatSlider.value = 20;
        bodyFatValue.textContent = '20.0';
    }

    // 同步圖表（如有）
    if (window.syncSliderValues) window.syncSliderValues();
    if (window.updateMuscleLimitChart) window.updateMuscleLimitChart();
    initCalendarWithRecords(data.records || {});

    // 如果 bodyplanner_chart 有定義 initStagesFromData()，就呼叫它
    if (data.stages && window.initStagesFromData) {
        window.initStagesFromData(data.stages);
    }

}


// 👉 儲存資料
window.saveUserData = async function () {
    const user = auth.currentUser;
    if (!user) {
        alert('請先登入！');
        return;
    }

    // 取得輸入值
    const recordDate = document.getElementById('recordDate').value;
    if (!recordDate) {
        alert('請選擇紀錄日期');
        return;
    }

    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value);
    const wrist = parseFloat(document.getElementById('wrist').value);
    const ankle = parseFloat(document.getElementById('ankle').value);

    const userDocRef = doc(db, 'users', user.uid);

    const userData = {
        gender,
        height,
        wrist,
        ankle,
        records: {
            [recordDate]: {
                weight,
                bodyFat
            }
        }
    };

    try {
        const existingDoc = await getDoc(userDocRef);
        if (existingDoc.exists()) {
            // 合併新紀錄到現有紀錄
            const oldData = existingDoc.data();
            const updatedRecords = { ...(oldData.records || {}), ...userData.records };

            await setDoc(userDocRef, {
                ...oldData,
                gender,
                height,
                wrist,
                ankle,
                records: updatedRecords
            });

        } else {
            await setDoc(userDocRef, userData);
        }

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

const recordDateInput = document.getElementById('recordDate');

recordDateInput.addEventListener('change', async () => {
    const user = auth.currentUser;
    const recordDate = recordDateInput.value;
    if (!user || !recordDate) return;

    const userDocRef = doc(db, 'users', user.uid);
    try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const data = userDoc.data();
            const records = data.records || {};

            // 如果該日期有紀錄，就使用它
            if (records[recordDate]) {
                const record = records[recordDate];
                document.getElementById('weight').value = record.weight;
                document.getElementById('weightValue').textContent = parseFloat(record.weight).toFixed(1);

                document.getElementById('bodyFat').value = record.bodyFat;
                document.getElementById('bodyFatValue').textContent = parseFloat(record.bodyFat).toFixed(1);
                return;
            }

            // 該日期無資料，嘗試使用最近一筆舊資料
            const dates = Object.keys(records).sort(); // 升冪排序
            const earlierDates = dates.filter(d => d < recordDate); // 找到所有比選取日期更早的

            if (earlierDates.length > 0) {
                const latestPriorDate = earlierDates[earlierDates.length - 1];
                const fallback = records[latestPriorDate];

                document.getElementById('weight').value = fallback.weight;
                document.getElementById('weightValue').textContent = parseFloat(fallback.weight).toFixed(1);

                document.getElementById('bodyFat').value = fallback.bodyFat;
                document.getElementById('bodyFatValue').textContent = parseFloat(fallback.bodyFat).toFixed(1);
                return;
            }

            // 沒有任何紀錄 ➜ 使用預設值
            document.getElementById('weight').value = 70;
            document.getElementById('weightValue').textContent = '70.0';

            document.getElementById('bodyFat').value = 20;
            document.getElementById('bodyFatValue').textContent = '20.0';
        }
    } catch (error) {
        console.error('載入紀錄錯誤：', error);
    }
});

function initCalendarWithRecords(records) {
    const recordDates = Object.keys(records || {});

    flatpickr("#recordDate", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        disableMobile: true,
        onChange: function (selectedDates, dateStr) {
            document.getElementById('recordDate').value = dateStr;
            document.getElementById('recordDate').dispatchEvent(new Event('change'));
        },
        // 使用自定義的 markClass 顯示有紀錄的日期
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const dateStr = dayElem.dateObj.toISOString().split('T')[0];
            if (recordDates.includes(dateStr)) {
                dayElem.classList.add('has-record');
            }
        }
    });
}
