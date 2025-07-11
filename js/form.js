// form.js
import { db, doc, setDoc } from './firebase.js';

const userForm = document.getElementById('userForm');
const genderInput = document.getElementById('gender');
const heightSlider = document.getElementById('height');
const weightSlider = document.getElementById('weight');
const bodyFatSlider = document.getElementById('bodyFat');

const wristSlider = document.getElementById('wrist');
const ankleSlider = document.getElementById('ankle');

export function setupForm(auth) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert('請先登入！');
            return;
        }

        const userData = {
            gender: genderInput.value,
            height: parseFloat(heightSlider.value),
            weight: parseFloat(weightSlider.value),
            bodyFat: parseFloat(bodyFatSlider.value),
            wrist: parseFloat(wristSlider.value),
            ankle: parseFloat(ankleSlider.value)
        };

        try {
            await setDoc(doc(db, 'users', user.uid), userData);
            alert('資料已儲存！');
        } catch (error) {
            console.error('儲存錯誤：', error);
            alert('儲存失敗！');
        }
    });
}
