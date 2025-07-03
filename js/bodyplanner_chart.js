

let heightInput, weightInput, bodyFatInput, wristInput, ankleInput;
let bodyplannerChart;

let stages = [];
let currentStageIndex = null;

// 將所有需要的函式掛到 window
window.addCondition = addCondition;
window.updateConditionType = updateConditionType;
window.updateConditionOperator = updateConditionOperator;
window.updateConditionTarget = updateConditionTarget;
window.deleteCondition = deleteCondition;

window.adjustStageSlider = adjustStageSlider;
window.saveStage = saveStage;
window.selectRadioButton = selectRadioButton;
window.selectLogicButton = selectLogicButton;

function selectRadioButton(button) {
    const group = button.parentElement;
    const name = button.dataset.name;
    group.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    if (currentStageIndex !== null) {
        stages[currentStageIndex][name] = button.dataset.value;
        simulateBodyPlanner();
    }
}

function selectLogicButton(button) {
    if (currentStageIndex === null) return;
    const group = button.parentElement;
    group.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    stages[currentStageIndex].conditionLogic = button.dataset.value;
    simulateBodyPlanner();
}

document.addEventListener('DOMContentLoaded', () => {
    heightInput = document.getElementById('height');
    weightInput = document.getElementById('weight');
    bodyFatInput = document.getElementById('bodyFat');
    wristInput = document.getElementById('wrist');
    ankleInput = document.getElementById('ankle');

    document.getElementById('addPhaseBtn').addEventListener('click', () => addStage());

    [heightInput, weightInput, bodyFatInput, wristInput, ankleInput].forEach(input => {
        input.addEventListener('input', () => {
            simulateBodyPlanner();
        });
    });

    document.getElementById('weeklyChange').addEventListener('input', (e) => {
        updateStageSliderDisplay('weeklyChange', e.target.value);
    });

    document.getElementById('muscleRatio').addEventListener('input', (e) => {
        updateStageSliderDisplay('muscleRatio', e.target.value);
    });

    document.getElementById('restInterval').addEventListener('input', (e) => {
        updateStageSliderDisplay('restInterval', e.target.value);
    });

    document.getElementById('restDuration').addEventListener('input', (e) => {
        updateStageSliderDisplay('restDuration', e.target.value);
    });

    initializeBodyplannerChart();
    renderStageButtons();
    simulateBodyPlanner();

    if (stages.length === 0) {
        addStage();
    }
});

function initializeBodyplannerChart() {
    const ctx = document.getElementById('bodyplannerChart').getContext('2d');
    bodyplannerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '體重 (kg)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '體脂率 (%)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y2'
                },
                {
                    label: '淨體重 (kg)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '淨體重比例 (%)',
                    data: [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: '體重與體脂率追蹤圖（週數）'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    display: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    title: { display: true, text: '週數' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: '體重 (kg)' }
                },
                y2: {
                    position: 'right',
                    title: { display: true, text: '體脂率 (%) / 淨體重比例 (%)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}


function renderStageButtons() {
    const container = document.getElementById('stageButtons');
    container.innerHTML = '';

    stages.forEach((stage, index) => {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.display = 'inline-flex';
        buttonWrapper.style.alignItems = 'center';
        buttonWrapper.style.marginRight = '10px';
        buttonWrapper.style.marginBottom = '10px';

        const button = document.createElement('button');
        button.textContent = stage.name || `階段 ${index + 1}`;
        button.classList.add('radio-button');
        if (index === currentStageIndex) {
            button.classList.add('active');
        }
        button.onclick = () => {
            selectStage(index);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.style.marginLeft = '5px';
        deleteButton.onclick = () => {
            deleteStage(index);
        };

        buttonWrapper.appendChild(button);
        buttonWrapper.appendChild(deleteButton);
        container.appendChild(buttonWrapper);
    });
}

function selectStage(index) {
    currentStageIndex = index;
    const stage = stages[index];

    document.getElementById('stageName').value = stage.name;
    document.getElementById('weeklyChange').value = stage.weeklyChange;
    document.getElementById('weeklyChangeDisplay').textContent = stage.weeklyChange;
    document.getElementById('weeklyCalorieDeltaDisplay').textContent = (stage.weeklyChange * 7700).toFixed(0);
    document.getElementById('muscleRatio').value = stage.muscleRatio;
    document.getElementById('muscleRatioDisplay').textContent = stage.muscleRatio;
    document.getElementById('restInterval').value = stage.restInterval;
    document.getElementById('restIntervalDisplay').textContent = stage.restInterval;
    document.getElementById('restDuration').value = stage.restDuration;
    document.getElementById('restDurationDisplay').textContent = stage.restDuration;

    document.querySelectorAll('#conditionLogicGroup .radio-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#conditionLogicGroup .radio-button[data-value="${stage.conditionLogic}"]`).classList.add('active');

    renderConditionList();
    renderStageButtons();
    simulateBodyPlanner();
}



function addStage() {
    const newStage = {
        name: `階段 ${stages.length + 1}`,
        weeklyChange: -0.2,
        muscleRatio: 50,
        restInterval: 4,
        restDuration: 1,
        conditionLogic: 'OR',
        conditions: [
            { type: 'bodyFat', operator: '<=', targetValue: 20 } // 👉 預設條件：體脂 <= 20
        ]
    };
    stages.push(newStage);
    selectStage(stages.length - 1);
    renderStageButtons();
    simulateBodyPlanner();
}


function deleteStage(index) {
    stages.splice(index, 1);
    if (stages.length === 0) {
        currentStageIndex = null;
    } else if (currentStageIndex >= stages.length) {
        currentStageIndex = stages.length - 1;
    }
    if (currentStageIndex !== null) {
        selectStage(currentStageIndex);
    } else {
        clearStageInputs();
    }
    renderStageButtons();
    simulateBodyPlanner();
}

function clearStageInputs() {
    document.getElementById('stageName').value = '';
    document.getElementById('weeklyChange').value = 0;
    document.getElementById('weeklyChangeDisplay').textContent = stage.weeklyChange.toFixed(1);
    document.getElementById('muscleRatio').value = 50;
    document.getElementById('muscleRatioDisplay').textContent = 50;
    document.getElementById('restInterval').value = 4;
    document.getElementById('restIntervalDisplay').textContent = 4;
    document.getElementById('restDuration').value = 1;
    document.getElementById('restDurationDisplay').textContent = 1;
    document.getElementById('conditionList').innerHTML = '';
}

function updateStageSliderDisplay(field, value) {
    if (currentStageIndex === null) return;

    const stage = stages[currentStageIndex];
    stage[field] = parseFloat(value);
    document.getElementById(`${field}Display`).textContent = parseFloat(value).toFixed(1);

    // 👉 每週體重變化連動熱量顯示
    if (field === 'weeklyChange') {
        // 1kg ≈ 7700 kcal，假設 1kg 體重變化 ≈ 7700 kcal 熱量差
        const weeklyCalorieDelta = parseFloat(value) * 7700;
        document.getElementById('weeklyCalorieDeltaDisplay').textContent = weeklyCalorieDelta.toFixed(0);
    }

    simulateBodyPlanner();
}


function adjustStageSlider(field, step) {
    const slider = document.getElementById(field);
    let newValue = parseFloat(slider.value) + step;

    if (field === 'weeklyChange') {
        newValue = Math.max(-1.5, Math.min(1.5, newValue));
    } else if (field === 'muscleRatio') {
        newValue = Math.max(0, Math.min(100, newValue));
    } else if (field === 'restInterval') {
        newValue = Math.max(0, Math.min(20, newValue));
    } else if (field === 'restDuration') {
        newValue = Math.max(0, Math.min(8, newValue));
    }

    slider.value = newValue;
    updateStageSliderDisplay(field, newValue);
}

function updateBodyplannerChart(simulationData) {
    bodyplannerChart.data.labels = simulationData.labels;
    bodyplannerChart.data.datasets[0].data = simulationData.weights;
    bodyplannerChart.data.datasets[1].data = simulationData.bodyFats;
    bodyplannerChart.data.datasets[2].data = simulationData.leanMasses;
    bodyplannerChart.data.datasets[3].data = simulationData.leanMassPercents;

    bodyplannerChart.update();
}


function simulateBodyPlanner() {
    let currentWeight = parseFloat(weightInput.value);
    let currentBodyFat = parseFloat(bodyFatInput.value);

    const labels = [0];
    const weights = [parseFloat(currentWeight.toFixed(2))];
    const bodyFats = [parseFloat(currentBodyFat.toFixed(2))];
    const leanMasses = [parseFloat((currentWeight * (1 - currentBodyFat / 100)).toFixed(2))];
    const leanMassPercents = [parseFloat((100 - currentBodyFat).toFixed(2))];

    let week = 0;

    if (stages.length === 0) {
        updateBodyplannerChart({ labels, weights, bodyFats, leanMasses, leanMassPercents });
        return;
    }

    stages.forEach(stage => {
        while (true) {
            week++;
            labels.push(week);
            weights.push(parseFloat(currentWeight.toFixed(2)));
            bodyFats.push(parseFloat(currentBodyFat.toFixed(2)));

            let leanMass = currentWeight * (1 - currentBodyFat / 100);
            leanMasses.push(parseFloat(leanMass.toFixed(2)));
            leanMassPercents.push(parseFloat((100 - currentBodyFat).toFixed(2)));

            if (week > 300) break;

            if (stage.restInterval > 0 && (week % stage.restInterval) < stage.restDuration) {
                continue;
            }

            let weeklyChange = stage.weeklyChange;
            let muscleGain = weeklyChange * (stage.muscleRatio / 100);
            let fatGain = weeklyChange * (1 - stage.muscleRatio / 100);

            currentWeight += weeklyChange;
            let totalLeanMass = currentWeight * (1 - currentBodyFat / 100) + muscleGain;
            let totalFatMass = currentWeight * (currentBodyFat / 100) + fatGain;

            currentWeight = totalLeanMass + totalFatMass;
            currentBodyFat = (totalFatMass / currentWeight) * 100;

            if (stage.conditions.length > 0 && checkStageConditions(stage, week, currentWeight, currentBodyFat)) {
                break;
            }

            if (Math.abs(weeklyChange) < 0.0001) break;
        }
    });

    updateBodyplannerChart({ labels, weights, bodyFats, leanMasses, leanMassPercents });
}


function checkStageConditions(stage, week, currentWeight, currentBodyFat) {
    let isMet = stage.conditionLogic === 'AND' ? true : false;

    let currentLeanMass = currentWeight * (1 - currentBodyFat / 100);
    let maxLeanMass = calculateLeanMass(
        parseFloat(heightInput.value),
        parseFloat(wristInput.value),
        parseFloat(ankleInput.value),
        currentBodyFat
    );
    let leanMassToLimitPercent = (currentLeanMass / maxLeanMass) * 100;

    stage.conditions.forEach(condition => {
        let target = condition.targetValue;
        let value = 0;

        if (condition.type === 'weight') value = currentWeight;
        if (condition.type === 'leanMass') value = currentLeanMass;
        if (condition.type === 'bodyFat') value = currentBodyFat;
        if (condition.type === 'leanMassToLimitPercent') value = leanMassToLimitPercent;
        if (condition.type === 'weeks') value = week;

        if (stage.conditionLogic === 'AND') {
            if (!checkCondition(value, condition.operator, target)) isMet = false;
        } else {
            if (checkCondition(value, condition.operator, target)) isMet = true;
        }
    });
    return isMet;
}

function calculateLeanMass(height, wrist, ankle, bodyFat) {
    return Math.pow(height, 1.5) * (Math.sqrt(wrist) / 322.4 + Math.sqrt(ankle) / 241.9) * (bodyFat / 224 + 1);
}


function checkCondition(value, operator, target) {
    if (operator === '>=') return value >= target;
    if (operator === '<=') return value <= target;
    if (operator === '=') return Math.abs(value - target) < 0.01;
    return false;
}

function saveStage() {
    if (currentStageIndex === null) return;
    const stage = stages[currentStageIndex];

    stage.name = document.getElementById('stageName').value;
    stage.weeklyChange = parseFloat(document.getElementById('weeklyChange').value);
    stage.muscleRatio = parseFloat(document.getElementById('muscleRatio').value);
    stage.restInterval = parseFloat(document.getElementById('restInterval').value);
    stage.restDuration = parseFloat(document.getElementById('restDuration').value);

    renderStageButtons();
    simulateBodyPlanner();
}

function addCondition() {
    if (currentStageIndex === null) return;
    stages[currentStageIndex].conditions.push({ type: 'weight', operator: '>=', targetValue: 70 });
    renderConditionList();
}

function renderConditionList() {
    if (currentStageIndex === null) return;
    const stage = stages[currentStageIndex];
    const container = document.getElementById('conditionList');
    container.innerHTML = '';

    stage.conditions.forEach((cond, index) => {
        const div = document.createElement('div');

        div.innerHTML = `
            <select onchange="updateConditionType(${index}, this.value)">
                <option value="weight" ${cond.type === 'weight' ? 'selected' : ''}>體重</option>
                <option value="leanMass" ${cond.type === 'leanMass' ? 'selected' : ''}>淨體重</option>
                <option value="bodyFat" ${cond.type === 'bodyFat' ? 'selected' : ''}>體脂率</option>
                <option value="leanMassToLimitPercent" ${cond.type === 'leanMassToLimitPercent' ? 'selected' : ''}>淨體重/極限淨體重比</option>
                <option value="weeks" ${cond.type === 'weeks' ? 'selected' : ''}>週數</option>
            </select>
            <select onchange="updateConditionOperator(${index}, this.value)">
                <option value=">=" ${cond.operator === '>=' ? 'selected' : ''}>≥</option>
                <option value="<=" ${cond.operator === '<=' ? 'selected' : ''}>≤</option>
                <option value="=" ${cond.operator === '=' ? 'selected' : ''}>=</option>
            </select>
            <input type="number" value="${cond.targetValue}" onchange="updateConditionTarget(${index}, this.value)">
            <button onclick="deleteCondition(${index})">刪除</button>
        `;
        container.appendChild(div);
    });
}


function updateConditionType(index, value) {
    stages[currentStageIndex].conditions[index].type = value;
    simulateBodyPlanner();
}

function updateConditionOperator(index, value) {
    stages[currentStageIndex].conditions[index].operator = value;
    simulateBodyPlanner();
}

function updateConditionTarget(index, value) {
    stages[currentStageIndex].conditions[index].targetValue = parseFloat(value);
    simulateBodyPlanner();
}

function deleteCondition(index) {
    stages[currentStageIndex].conditions.splice(index, 1);
    renderConditionList();
    simulateBodyPlanner();
}
