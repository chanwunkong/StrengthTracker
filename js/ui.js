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

const wristSlider = document.getElementById('wrist');
const wristValue = document.getElementById('wristValue');
const decreaseWrist = document.getElementById('decreaseWrist');
const increaseWrist = document.getElementById('increaseWrist');

const ankleSlider = document.getElementById('ankle');
const ankleValue = document.getElementById('ankleValue');
const decreaseAnkle = document.getElementById('decreaseAnkle');
const increaseAnkle = document.getElementById('increaseAnkle');

export function setupUI() {
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        formContainer.style.marginLeft = sidebar.classList.contains('collapsed') ? '20px' : '270px';
    });

    genderButtons.forEach(button => {
        button.addEventListener('click', () => {
            genderButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            genderInput.value = button.getAttribute('data-gender');
            genderDisplay.textContent = button.getAttribute('data-gender');
        });
    });

    setupSlider(heightSlider, heightValue, decreaseHeight, increaseHeight, 0.1);
    setupSlider(weightSlider, weightValue, decreaseWeight, increaseWeight, 0.1);
    setupSlider(bodyFatSlider, bodyFatValue, decreaseBodyFat, increaseBodyFat, 0.1);
    setupSlider(wristSlider, wristValue, decreaseWrist, increaseWrist, 0.1);
    setupSlider(ankleSlider, ankleValue, decreaseAnkle, increaseAnkle, 0.1);
}

function triggerAllCharts() {
    if (window.syncSliderValues) window.syncSliderValues();
    if (window.updateFFMIChart) window.updateFFMIChart();
    if (window.updateMuscleLimitChart) window.updateMuscleLimitChart();
}

function setupSlider(slider, valueDisplay, decreaseBtn, increaseBtn, step = 0.1) {
    slider.addEventListener('input', () => {
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
        triggerAllCharts();
    });

    decreaseBtn.addEventListener('click', () => {
        slider.value = Math.max(parseFloat(slider.min), parseFloat(slider.value) - step);
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
        triggerAllCharts();
    });

    increaseBtn.addEventListener('click', () => {
        slider.value = Math.min(parseFloat(slider.max), parseFloat(slider.value) + step);
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
        triggerAllCharts();
    });
}
