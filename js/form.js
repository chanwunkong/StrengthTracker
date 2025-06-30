// form.js
import { db, doc, setDoc } from './firebase.js';

const userForm = document.getElementById('userForm');
const genderInput = document.getElementById('gender');
const heightSlider = document.getElementById('height');
const weightSlider = document.getElementById('weight');
const bodyFatSlider = document.getElementById('bodyFat');

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
            height: parseInt(heightSlider.value),
            weight: parseInt(weightSlider.value),
            bodyFat: parseInt(bodyFatSlider.value)
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
