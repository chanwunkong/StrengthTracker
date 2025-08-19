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

setupUI();
setupForm(auth);



loginBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => console.log('登入成功', result.user))
        .catch((error) => console.error('登入錯誤：', error.message));
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

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

            updateUserInfo(data);

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

    genderInput.value = data.gender;
    genderDisplay.textContent = data.gender;

    genderButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-value') === data.gender) {
            btn.classList.add('active');
        }
    });

    heightSlider.value = data.height;
    heightValue.textContent = parseFloat(data.height).toFixed(1);

    wristSlider.value = data.wrist;
    wristValue.textContent = parseFloat(data.wrist).toFixed(1);

    ankleSlider.value = data.ankle;
    ankleValue.textContent = parseFloat(data.ankle).toFixed(1);


    const records = data.records || {};
    const dateList = Object.keys(records).sort();
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
        weightSlider.value = 70;
        weightValue.textContent = '70.0';
        bodyFatSlider.value = 20;
        bodyFatValue.textContent = '20.0';
    }

    if (window.syncSliderValues) window.syncSliderValues();
    if (window.updateMuscleLimitChart) window.updateMuscleLimitChart();
    initCalendarWithRecords(records);

    if (window.initStagesFromData) {
        window.initStagesFromData({
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            stages: data.stages || []
        });
    }

    window.bodyPlannerChartReadyCallback = () => {
        if (window.loadHistoricalRecords) {
            const startDate = data.startDate || new Date().toISOString().split('T')[0];
            window.loadHistoricalRecords(startDate, records);
        }
    };
}

window.saveUserData = async function () {
    const user = auth.currentUser;
    if (!user) { alert('請先登入！'); return; }

    // 1) 取得 input 元素與值（而不是用元素本身）
    const recordDateEl = document.getElementById('recordDate');
    const dateKey = (recordDateEl?.value || '').trim();
    if (!dateKey) { alert('請選擇紀錄日期'); return; }

    // 2) 其他欄位
    const gender = document.getElementById('gender').value;
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value);
    const wrist = parseFloat(document.getElementById('wrist').value);
    const ankle = parseFloat(document.getElementById('ankle').value);

    const userDocRef = doc(db, 'users', user.uid);

    try {
        const existingDoc = await getDoc(userDocRef);
        if (existingDoc.exists()) {
            const oldData = existingDoc.data();
            const updatedRecords = { ...(oldData.records || {}) };
            updatedRecords[dateKey] = { weight, bodyFat };

            await setDoc(userDocRef, {
                ...oldData,
                gender, height, wrist, ankle,
                records: updatedRecords
            });
        } else {
            await setDoc(userDocRef, {
                gender, height, wrist, ankle,
                records: { [dateKey]: { weight, bodyFat } }
            });
        }

        alert('資料已成功儲存！');
    } catch (error) {
        console.error('儲存失敗：', error);
        alert('資料儲存失敗，請稍後再試。');
    }
}


window.deleteUserRecord = async function () {
    const user = auth.currentUser;
    if (!user) {
        alert('請先登入！');
        return;
    }

    const recordDate = document.getElementById('recordDate').value;
    if (!recordDate) {
        alert('請選擇要刪除的紀錄日期');
        return;
    }

    const confirmDelete = confirm(`確定要刪除 ${recordDate} 的紀錄嗎？`);
    if (!confirmDelete) return;

    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert('使用者資料不存在');
            return;
        }

        const data = userDoc.data();
        const records = data.records || {};

        if (!records[recordDate]) {
            alert('該日期沒有紀錄可刪除');
            return;
        }

        delete records[recordDate];

        await setDoc(userDocRef, {
            ...data,
            records
        });

        alert(`已刪除 ${recordDate} 的紀錄`);

        document.getElementById('weight').value = 70;
        document.getElementById('weightValue').textContent = '70.0';
        document.getElementById('bodyFat').value = 20;
        document.getElementById('bodyFatValue').textContent = '20.0';


        if (window.syncSliderValues) window.syncSliderValues();
        if (window.updateMuscleLimitChart) window.updateMuscleLimitChart();

    } catch (error) {
        console.error('刪除紀錄錯誤：', error);
        alert('刪除失敗，請稍後再試。');
    }
};

window.selectRadioButton = function (button) {
    const group = button.parentElement;
    const buttons = group.querySelectorAll('.radio-button');

    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const dataName = button.getAttribute('data-name');
    const dataValue = button.getAttribute('data-value');

    document.getElementById(dataName).value = dataValue;

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

            if (records[recordDate]) {
                const record = records[recordDate];
                document.getElementById('weight').value = record.weight;
                document.getElementById('weightValue').textContent = parseFloat(record.weight).toFixed(1);

                document.getElementById('bodyFat').value = record.bodyFat;
                document.getElementById('bodyFatValue').textContent = parseFloat(record.bodyFat).toFixed(1);
                return;
            }

            const dates = Object.keys(records).sort();
            const earlierDates = dates.filter(d => d < recordDate);

            if (earlierDates.length > 0) {
                const latestPriorDate = earlierDates[earlierDates.length - 1];
                const fallback = records[latestPriorDate];

                document.getElementById('weight').value = fallback.weight;
                document.getElementById('weightValue').textContent = parseFloat(fallback.weight).toFixed(1);

                document.getElementById('bodyFat').value = fallback.bodyFat;
                document.getElementById('bodyFatValue').textContent = parseFloat(fallback.bodyFat).toFixed(1);
                return;
            }

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
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const dateObj = dayElem.dateObj;

            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');

            const localDateStr = `${year}-${month}-${day}`;

            if (recordDates.includes(localDateStr)) {
                dayElem.classList.add('has-record');
            }
        }
    });
}
