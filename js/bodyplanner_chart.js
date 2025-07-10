// bodyplanner_chart.js
import { auth, db, doc, setDoc, getDoc } from './firebase.js';

window.initStagesFromData = function (data) {
    stages = Array.isArray(data.stages) ? data.stages : [];
    planStartDate = data.startDate || formatDateToLocalString(new Date());
    currentStageIndex = 0;

    initStartDatePicker();
    renderStageButtons();

    if (stages.length > 0) {
        selectStage(0);
    } else {
        addStage();
    }
};

let heightInput, weightInput, bodyFatInput, wristInput, ankleInput;
let bodyplannerChart;

let stages = [];
let currentStageIndex = null;
let planStartDate;

window.addCondition = addCondition;
window.updateConditionType = updateConditionType;
window.updateConditionOperator = updateConditionOperator;
window.updateConditionTarget = updateConditionTarget;
window.deleteCondition = deleteCondition;

window.adjustStageSlider = adjustStageSlider;
window.saveStage = saveStage;
window.selectRadioButton = selectRadioButton;
window.selectLogicButton = selectLogicButton;

window.loadHistoricalRecords = function (startDate, records) {
    const start = new Date(startDate);
    const weekLabels = [];
    const weightPoints = [];
    const bodyFatPoints = [];

    Object.keys(records)
        .sort()
        .forEach(dateStr => {
            const date = new Date(dateStr);
            const diffDays = (date - start) / (1000 * 60 * 60 * 24);
            if (diffDays < 0) return;

            const week = diffDays / 7;
            const data = records[dateStr];

            weekLabels.push(week.toFixed(2));
            weightPoints.push(parseFloat(data.weight.toFixed(2)));
            bodyFatPoints.push(parseFloat(data.bodyFat.toFixed(2)));
        });

    bodyplannerChart.data.labels = weekLabels;
    bodyplannerChart.data.datasets[0].data = weightPoints;
    bodyplannerChart.data.datasets[1].data = bodyFatPoints;

    bodyplannerChart.data.datasets[2].data = [];
    bodyplannerChart.data.datasets[3].data = [];

    bodyplannerChart.update();
};

function selectRadioButton(button) {
    const group = button.parentElement;
    const name = button.dataset.name;
    const value = button.dataset.value;

    group.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    if (name === 'goalType') {
        const displayText = button.textContent;
        document.getElementById('goalTypeDisplay').textContent = displayText;
    }

    if (currentStageIndex !== null) {
        stages[currentStageIndex][name] = value;
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

function initStartDatePicker() {
    flatpickr("#startDate", {
        dateFormat: "Y-m-d",
        defaultDate: planStartDate,
        disableMobile: true,
        onChange: (selectedDates) => {
            if (selectedDates.length > 0) {
                planStartDate = formatDateToLocalString(selectedDates[0]);
                simulateBodyPlanner();
            }
        }
    });
}

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
                },
                annotation: {
                    annotations: {}
                },
                datalabels: {
                    display: function(ctx) {
                        const highlightIndexes = ctx.chart.options.plugins.datalabels.highlightIndexes || [];
                        return highlightIndexes.includes(ctx.dataIndex);
                    },
                    align: 'top',
                    anchor: 'end',
                    formatter: function(value) {
                        return value.toFixed(1);
                    },
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    color: 'black',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    borderRadius: 3,
                    padding: 4
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
        },
        plugins: [ChartDataLabels]
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

    if (document.getElementById('startDate')._flatpickr) {
        document.getElementById('startDate')._flatpickr.setDate(planStartDate, true);
    }

    document.getElementById('muscleChange').value = stage.muscleChange;
    updateStageSliderDisplay('muscleChange', stage.muscleChange);

    document.getElementById('fatChange').value = stage.fatChange;
    updateStageSliderDisplay('fatChange', stage.fatChange);

    document.getElementById('restInterval').value = stage.restInterval;
    updateStageSliderDisplay('restInterval', stage.restInterval);

    document.getElementById('restDuration').value = stage.restDuration;
    updateStageSliderDisplay('restDuration', stage.restDuration);

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
        muscleChange: 0,
        fatChange: 0,
        restInterval: 4,
        restDuration: 1,
        conditionLogic: 'OR',
        conditions: [
            { type: 'bodyFat', operator: '<=', targetValue: Math.max(5, Math.min(40, 20)) }
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

    document.getElementById('muscleChange').value = 0;
    updateStageSliderDisplay('muscleChange', 0);

    document.getElementById('fatChange').value = 0;
    updateStageSliderDisplay('fatChange', 0);

    document.getElementById('restInterval').value = 4;
    updateStageSliderDisplay('restInterval', 4);

    document.getElementById('restDuration').value = 1;
    updateStageSliderDisplay('restDuration', 1);

    document.getElementById('conditionList').innerHTML = '';

    simulateBodyPlanner();
}

function updateStageSliderDisplay(field, value) {
    if (currentStageIndex === null) return;

    value = safeParseFloat(value, 0);
    const stage = stages[currentStageIndex];
    stage[field] = value;

    document.getElementById(`${field}Display`).textContent = value.toFixed(2);

    const muscleChange = stage.muscleChange || 0;
    const fatChange = stage.fatChange || 0;
    const totalChange = muscleChange + fatChange;
    const calorieDelta = fatChange * 7700 + muscleChange * 2500; 

    document.getElementById('weeklyChangeDisplay').textContent = totalChange.toFixed(2);
    document.getElementById('weeklyCalorieDeltaDisplay').textContent = calorieDelta.toFixed(0);

    simulateBodyPlanner();
}

function adjustStageSlider(field, step) {
    const sliderLimits = {
        muscleChange: { min: -1.5, max: 1.5 },
        fatChange: { min: -1.5, max: 1.5 },
        restInterval: { min: 0, max: 20 },
        restDuration: { min: 0, max: 8 }
    };

    const slider = document.getElementById(field);
    let newValue = parseFloat(slider.value) + step;

    if (sliderLimits[field]) {
        newValue = Math.max(sliderLimits[field].min, Math.min(sliderLimits[field].max, newValue));
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

    const annotations = {};
    simulationData.stageEndWeeks.forEach((week, index) => {
        const w = simulationData.weights[week];
        const bf = simulationData.bodyFats[week];
        const lm = simulationData.leanMasses[week];
        const lmp = simulationData.leanMassPercents[week];

        annotations[`line${index}`] = {
            type: 'line',
            scaleID: 'x',
            value: week,
            borderColor: 'red',
            borderWidth: 2,
            label: {
                display: true,
                content: [
                    `週 ${week}`,
                    `體重: ${w.toFixed(1)}kg`,
                    `體脂: ${bf.toFixed(1)}%`,
                    `淨重: ${lm.toFixed(1)}kg`,
                    `淨重比: ${lmp.toFixed(1)}%`
                ],
                position: 'start',
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: 'black',
                font: { size: 10 },
                padding: 6
            }
        };
    });

    bodyplannerChart.options.plugins.annotation.annotations = annotations;
    bodyplannerChart.update();
}

function simulateBodyPlanner() {
    let currentWeight = parseFloat(weightInput.value);
    let currentBodyFat = parseFloat(bodyFatInput.value);

    const labels = [0];
    const weights = [parseFloat(currentWeight.toFixed(2))];
    const bodyFats = [parseFloat(currentBodyFat.toFixed(2))];

    let leanMass = currentWeight * (1 - currentBodyFat / 100);
    let maxLeanMass = calculateLeanMass(
        parseFloat(heightInput.value),
        parseFloat(wristInput.value),
        parseFloat(ankleInput.value),
        currentBodyFat
    );
    let leanMassPercent = (leanMass / maxLeanMass) * 100;

    const leanMasses = [parseFloat(leanMass.toFixed(2))];
    const leanMassPercents = [parseFloat(leanMassPercent.toFixed(2))];

    let week = 0;
    const stageEndWeeks = [];
    const stageStartWeeks = [0]; 

    if (stages.length === 0) {
        updateBodyplannerChart({ labels, weights, bodyFats, leanMasses, leanMassPercents, stageEndWeeks });
        return;
    }

    stages.forEach(stage => {
        const stageStart = week + 1;

        while (true) {
            week++;

            if (week > 300) {
                console.warn('模擬超過 300 週，強制中止，可能存在無限迴圈。');
                break;
            }

            if (stage.restInterval > 0 && (week % stage.restInterval) < stage.restDuration) {
                labels.push(week);
                weights.push(parseFloat(currentWeight.toFixed(2)));
                bodyFats.push(parseFloat(currentBodyFat.toFixed(2)));

                leanMass = currentWeight * (1 - currentBodyFat / 100);
                maxLeanMass = calculateLeanMass(
                    parseFloat(heightInput.value),
                    parseFloat(wristInput.value),
                    parseFloat(ankleInput.value),
                    currentBodyFat
                );
                leanMassPercent = (leanMass / maxLeanMass) * 100;

                leanMasses.push(parseFloat(leanMass.toFixed(2)));
                leanMassPercents.push(parseFloat(leanMassPercent.toFixed(2)));

                continue;
            }

            let muscleGain = stage.muscleChange || 0;
            let fatGain = stage.fatChange || 0;

            leanMass = currentWeight * (1 - currentBodyFat / 100);
            let fatMass = currentWeight * (currentBodyFat / 100);

            leanMass += muscleGain;
            fatMass += fatGain;

            currentWeight = leanMass + fatMass;
            currentBodyFat = (fatMass / currentWeight) * 100;

            labels.push(week);
            weights.push(parseFloat(currentWeight.toFixed(2)));
            bodyFats.push(parseFloat(currentBodyFat.toFixed(2)));

            maxLeanMass = calculateLeanMass(
                parseFloat(heightInput.value),
                parseFloat(wristInput.value),
                parseFloat(ankleInput.value),
                currentBodyFat
            );
            leanMassPercent = (leanMass / maxLeanMass) * 100;

            leanMasses.push(parseFloat(leanMass.toFixed(2)));
            leanMassPercents.push(parseFloat(leanMassPercent.toFixed(2)));

            if (stage.conditions.length > 0 && checkStageConditions(stage, week, currentWeight, currentBodyFat)) {
                stageEndWeeks.push(week);
                break;
            }

            if (Math.abs(muscleGain + fatGain) < 0.0001 &&
                !(stage.restInterval > 0 && (week % stage.restInterval) < stage.restDuration)) {
                break;
            }
        }

        stageStartWeeks.push(week + 1); 
    });

    const highlightIndexes = Array.from(new Set([...stageStartWeeks, ...stageEndWeeks]));

    if (bodyplannerChart?.options?.plugins?.datalabels) {
        bodyplannerChart.options.plugins.datalabels.highlightIndexes = highlightIndexes;
    }

    updateBodyplannerChart({ labels, weights, bodyFats, leanMasses, leanMassPercents, stageEndWeeks });
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

async function saveStage() {
    if (currentStageIndex === null) return;

    const stage = stages[currentStageIndex];

    stage.name = document.getElementById('stageName').value;
    stage.muscleChange = safeParseFloat(document.getElementById('muscleChange').value, 0);
    stage.fatChange = safeParseFloat(document.getElementById('fatChange').value, 0);
    stage.restInterval = safeParseFloat(document.getElementById('restInterval').value, 4);
    stage.restDuration = safeParseFloat(document.getElementById('restDuration').value, 1);

    renderStageButtons();
    simulateBodyPlanner();

    const user = auth.currentUser;
    if (!user) {
        alert('請先登入再儲存。');
        return;
    }

    if (!planStartDate) {
        const flatpickrInstance = document.getElementById('startDate')._flatpickr;
        if (flatpickrInstance && flatpickrInstance.selectedDates.length > 0) {
            planStartDate = formatDateToLocalString(flatpickrInstance.selectedDates[0]);
        } else {
            planStartDate = formatDateToLocalString(new Date()); 
        }
    }

    try {
        const userDocRef = doc(db, 'users', user.uid);

        const updatedData = {
            startDate: planStartDate,
            stages: stages
        };

        console.log("將儲存：", updatedData); 

        await setDoc(userDocRef, updatedData, { merge: true });
        console.log('階段資料已成功儲存');
        alert('儲存成功！');

        if (document.getElementById('startDate')._flatpickr) {
            document.getElementById('startDate')._flatpickr.setDate(planStartDate, true);
        }

    } catch (error) {
        console.error('儲存階段失敗：', error);
        alert(`儲存失敗：${error.message}`);
    }
}

function safeParseFloat(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
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
    stages[currentStageIndex].conditions[index].targetValue = safeParseFloat(value, 0);
    simulateBodyPlanner();
}

function deleteCondition(index) {
    stages[currentStageIndex].conditions.splice(index, 1);
    renderConditionList();
    simulateBodyPlanner();
}

function formatDateToLocalString(dateObj) {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}