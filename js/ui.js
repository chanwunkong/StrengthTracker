// ui.js
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const formContainer = document.querySelector('.form-container');

const genderButtons = document.querySelectorAll('.gender-btn');
const genderInput = document.getElementById('gender');
const genderDisplay = document.getElementById('genderDisplay');

const heightSlider = document.getElementById('height');
const heightValue = document.getElementById('heightValue');
const decreaseHeight = document.getElementById('decreaseHeight');
const increaseHeight = document.getElementById('increaseHeight');

const weightSlider = document.getElementById('weight');
const weightValue = document.getElementById('weightValue');
const decreaseWeight = document.getElementById('decreaseWeight');
const increaseWeight = document.getElementById('increaseWeight');

const bodyFatSlider = document.getElementById('bodyFat');
const bodyFatValue = document.getElementById('bodyFatValue');
const decreaseBodyFat = document.getElementById('decreaseBodyFat');
const increaseBodyFat = document.getElementById('increaseBodyFat');

export function setupUI() {
    // 側邊欄切換
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        formContainer.style.marginLeft = sidebar.classList.contains('collapsed') ? '20px' : '270px';
    });

    // 性別選擇按鈕
    genderButtons.forEach(button => {
        button.addEventListener('click', () => {
            genderButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            genderInput.value = button.getAttribute('data-gender');
            genderDisplay.textContent = button.getAttribute('data-gender');
        });
    });

    // 滑桿加減設定
    setupSlider(heightSlider, heightValue, decreaseHeight, increaseHeight);
    setupSlider(weightSlider, weightValue, decreaseWeight, increaseWeight);
    setupSlider(bodyFatSlider, bodyFatValue, decreaseBodyFat, increaseBodyFat);
}

function setupSlider(slider, valueDisplay, decreaseBtn, increaseBtn, step = 1) {
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
    });
    decreaseBtn.addEventListener('click', () => {
        slider.value = Math.max(parseInt(slider.min), parseInt(slider.value) - step);
        valueDisplay.textContent = slider.value;
    });
    increaseBtn.addEventListener('click', () => {
        slider.value = Math.min(parseInt(slider.max), parseInt(slider.value) + step);
        valueDisplay.textContent = slider.value;
    });
}
