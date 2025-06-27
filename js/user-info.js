
let userInfo = {
    gender: 'male',
    height: 170,
    weight: 70,
    bodyFat: 20
};

function selectGenderButton(button) {
    const buttons = document.querySelectorAll('.radio-button[data-name="gender"]');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    userInfo.gender = button.getAttribute('data-value');

    if (typeof updateChart === 'function') updateChart();
    if (typeof updateMusclePotentialChart === 'function') updateMusclePotentialChart();
    if (typeof updateBodyPhasePlannerChart === 'function') updateBodyPhasePlannerChart();
}

function updateUserInfo() {
    userInfo.height = parseFloat(document.getElementById('userHeight').value);
    userInfo.weight = parseFloat(document.getElementById('userWeight').value);
    userInfo.bodyFat = parseFloat(document.getElementById('userBodyFat').value);

    if (typeof updateChart === 'function') updateChart();
    if (typeof updateMusclePotentialChart === 'function') updateMusclePotentialChart();
    if (typeof updateBodyPhasePlannerChart === 'function') updateBodyPhasePlannerChart();
}
