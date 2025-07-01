let heightInput, weightInput, bodyFatInput, wristInput, ankleInput;

document.addEventListener('DOMContentLoaded', () => {
    heightInput = document.getElementById('height');
    weightInput = document.getElementById('weight');
    bodyFatInput = document.getElementById('bodyFat');
    wristInput = document.getElementById('wrist');
    ankleInput = document.getElementById('ankle');

    let stages = [];
    let currentStageIndex = null;

    function getBodyFatFactor(bodyFat) {
        if (bodyFat < 15) return 1.0;
        if (bodyFat < 20) return 0.8;
        return 0.6;
    }

    function calculateBulkingRate(progress, bodyFat) {
        let factor = getBodyFatFactor(bodyFat);
        let rate = 2.0 * (1 - progress) * factor;
        return Math.max(0.1, rate);
    }

    function calculateProgress() {
        let leanMass = parseFloat(weightInput.value) * (1 - parseFloat(bodyFatInput.value) / 100);
        return Math.min(1, leanMass / 75);
    }

    window.addStage = function () {
        const progress = calculateProgress();
        const goalType = 'bulking';
        let currentWeight = parseFloat(weightInput.value);
        let currentBodyFat = parseFloat(bodyFatInput.value);
        let recommendedRate = calculateBulkingRate(progress, currentBodyFat);
        let weeklyChange = (recommendedRate * currentWeight) / 4 / 100;
        let weeklyCalorieDelta = weeklyChange * 7700;

        const newStage = {
            name: '新階段',
            goalType: goalType,
            weeklyCalorieDelta: Math.round(weeklyCalorieDelta),
            weeklyChange: parseFloat(weeklyChange.toFixed(2)),
            muscleRatio: 50,
            conditionLogic: 'OR',
            conditions: [],
            restInterval: 12,
            restDuration: 2
        };

        stages.push(newStage);
        renderStageButtons();
        selectStage(stages.length - 1);
    };

    document.getElementById('weeklyCalorieDelta').addEventListener('input', () => {
        if (currentStageIndex === null) return;
        const calories = parseFloat(document.getElementById('weeklyCalorieDelta').value);
        const weeklyChange = calories / 7700;

        document.getElementById('weeklyChange').value = weeklyChange.toFixed(2);
        document.getElementById('weeklyChangeDisplay').textContent = weeklyChange.toFixed(2);

        stages[currentStageIndex].weeklyCalorieDelta = calories;
        stages[currentStageIndex].weeklyChange = weeklyChange;
    });

    document.getElementById('weeklyChange').addEventListener('input', () => {
        if (currentStageIndex === null) return;
        const weeklyChange = parseFloat(document.getElementById('weeklyChange').value);
        const calories = weeklyChange * 7700;

        document.getElementById('weeklyCalorieDelta').value = Math.round(calories);
        document.getElementById('weeklyCalorieDeltaDisplay').textContent = Math.round(calories);

        stages[currentStageIndex].weeklyChange = weeklyChange;
        stages[currentStageIndex].weeklyCalorieDelta = Math.round(calories);
    });

    function update() {
        simulateBodyPlanner();
    }

    [heightInput, weightInput, bodyFatInput, wristInput, ankleInput].forEach(input => {
        input.addEventListener('input', update);
    });

    window.selectStage = function (index) {
        currentStageIndex = index;
        const stage = stages[index];

        document.getElementById('stageName').value = stage.name;
        document.getElementById('weeklyCalorieDelta').value = stage.weeklyCalorieDelta;
        document.getElementById('weeklyCalorieDeltaDisplay').textContent = stage.weeklyCalorieDelta;

        document.getElementById('weeklyChange').value = stage.weeklyChange;
        document.getElementById('weeklyChangeDisplay').textContent = stage.weeklyChange;

        document.getElementById('muscleRatio').value = stage.muscleRatio;
        document.getElementById('muscleRatioDisplay').textContent = stage.muscleRatio;

        document.getElementById('restInterval').value = stage.restInterval;
        document.getElementById('restIntervalDisplay').textContent = stage.restInterval;

        document.getElementById('restDuration').value = stage.restDuration;
        document.getElementById('restDurationDisplay').textContent = stage.restDuration;

        selectLogicButtonByValue(stage.conditionLogic);
        selectRadioButtonByValue('goalTypeGroup', stage.goalType);

        renderConditionList();
        renderStageButtons();
    };

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
            button.textContent = stage.name;
            button.classList.add('radio-button');
            if (index === currentStageIndex) {
                button.classList.add('active');
            }
            button.onclick = () => {
                selectStage(index);
                renderStageButtons();
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

    function selectRadioButtonByValue(groupId, value) {
        document.querySelectorAll(`#${groupId} .radio-button`).forEach(button => {
            button.classList.toggle('active', button.dataset.value === value);
        });
    }

    window.deleteStage = function (index) {
        stages.splice(index, 1);

        if (stages.length === 0) {
            currentStageIndex = null;

            document.getElementById('stageName').value = '';
            document.getElementById('weeklyCalorieDelta').value = 0;
            document.getElementById('weeklyCalorieDeltaDisplay').textContent = 0;

            document.getElementById('weeklyChange').value = 0;
            document.getElementById('weeklyChangeDisplay').textContent = 0;

            document.getElementById('muscleRatio').value = 50;
            document.getElementById('muscleRatioDisplay').textContent = 50;

            document.getElementById('restInterval').value = 12;
            document.getElementById('restIntervalDisplay').textContent = 12;

            document.getElementById('restDuration').value = 2;
            document.getElementById('restDurationDisplay').textContent = 2;

            document.getElementById('conditionList').innerHTML = '';

            document.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('active'));

            renderStageButtons();
            return;
        }

        if (currentStageIndex === index) {
            currentStageIndex = 0;
        } else if (currentStageIndex > index) {
            currentStageIndex--;
        }

        selectStage(currentStageIndex);
        renderStageButtons();
    };

    window.selectRadioButton = function (button) {
        const group = button.parentElement;
        const name = button.dataset.name;

        group.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');

        stages[currentStageIndex][name] = button.dataset.value;
    };

    function selectLogicButtonByValue(value) {
        document.querySelectorAll(`#conditionLogicGroup .radio-button`).forEach(button => {
            button.classList.toggle('active', button.dataset.value === value);
        });
    }

    window.selectLogicButton = function (button) {
        stages[currentStageIndex].conditionLogic = button.dataset.value;
        document.querySelectorAll(`#conditionLogicGroup .radio-button`).forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === button.dataset.value);
        });
    };

    window.addCondition = function () {
        stages[currentStageIndex].conditions.push({ type: 'weight', operator: '>=', targetValue: 70 });
        renderConditionList();
    };

    window.deleteCondition = function (index) {
        stages[currentStageIndex].conditions.splice(index, 1);
        renderConditionList();
    };

    function renderConditionList() {
        const container = document.getElementById('conditionList');
        container.innerHTML = '';

        stages[currentStageIndex].conditions.forEach((cond, index) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div class="radio-button-group">
                    <button type="button" class="radio-button ${cond.type === 'weight' ? 'active' : ''}" onclick="selectConditionType(this, ${index})" data-type="weight">體重</button>
                    <button type="button" class="radio-button ${cond.type === 'bodyFat' ? 'active' : ''}" onclick="selectConditionType(this, ${index})" data-type="bodyFat">體脂率</button>
                    <button type="button" class="radio-button ${cond.type === 'progress' ? 'active' : ''}" onclick="selectConditionType(this, ${index})" data-type="progress">進度百分比</button>
                    <button type="button" class="radio-button ${cond.type === 'weeks' ? 'active' : ''}" onclick="selectConditionType(this, ${index})" data-type="weeks">周數</button>
                </div>
                <div class="radio-button-group">
                    <button type="button" class="radio-button ${cond.operator === '>=' ? 'active' : ''}" onclick="selectConditionOperator(this, ${index})" data-operator=">=">≥</button>
                    <button type="button" class="radio-button ${cond.operator === '<=' ? 'active' : ''}" onclick="selectConditionOperator(this, ${index})" data-operator="<=">≤</button>
                    <button type="button" class="radio-button ${cond.operator === '=' ? 'active' : ''}" onclick="selectConditionOperator(this, ${index})" data-operator="=">＝</button>
                </div>
                <input type="number" id="conditionValue${index}" value="${cond.targetValue}" onchange="updateConditionValue(${index}, this.value)">
                <button onclick="deleteCondition(${index})">刪除</button>
            `;
            container.appendChild(div);
        });
    }

    window.selectConditionType = function (button, index) {
        const buttons = button.parentElement.querySelectorAll('.radio-button');
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        stages[currentStageIndex].conditions[index].type = button.dataset.type;
    };

    window.selectConditionOperator = function (button, index) {
        const buttons = button.parentElement.querySelectorAll('.radio-button');
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        stages[currentStageIndex].conditions[index].operator = button.dataset.operator;
    };

    window.updateConditionValue = function (index, value) {
        stages[currentStageIndex].conditions[index].targetValue = parseFloat(value);
    };

    window.updateStageSliderDisplay = function (field, value) {
        document.getElementById(`${field}Display`).textContent = parseFloat(value);
    };

    window.adjustStageSlider = function (field, step) {
        const slider = document.getElementById(field);
        let newValue = parseFloat(slider.value) + step;
        if (field === 'weeklyChange') {
            newValue = Math.max(-1.5, Math.min(1.5, newValue));
        } else if (field === 'weeklyCalorieDelta') {
            newValue = Math.max(-10000, Math.min(5000, newValue));
        } else if (field === 'muscleRatio') {
            newValue = Math.max(0, Math.min(100, newValue));
        } else if (field === 'restInterval') {
            newValue = Math.max(0, Math.min(20, newValue));
        } else if (field === 'restDuration') {
            newValue = Math.max(0, Math.min(8, newValue));
        }
        slider.value = newValue;
        updateStageSliderDisplay(field, newValue);
    };

    window.saveStage = function () {
        if (currentStageIndex === null) return;
        const stage = stages[currentStageIndex];
        stage.name = document.getElementById('stageName').value;
        stage.weeklyCalorieDelta = parseFloat(document.getElementById('weeklyCalorieDelta').value);
        stage.weeklyChange = parseFloat(document.getElementById('weeklyChange').value);
        stage.muscleRatio = parseFloat(document.getElementById('muscleRatio').value);
        stage.restInterval = parseFloat(document.getElementById('restInterval').value);
        stage.restDuration = parseFloat(document.getElementById('restDuration').value);
        renderStageButtons();

        simulateBodyPlanner();
    };

    document.getElementById('addPhaseBtn').addEventListener('click', () => addStage());

    renderStageButtons();

    simulateBodyPlanner();
});

// 初始化圖表
const ctx = document.getElementById('bodyplannerChart').getContext('2d');
const bodyplannerChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: '體重 (kg)', data: [], borderColor: 'rgba(75, 192, 192, 1)', fill: false, tension: 0.1 },
            { label: '淨體重 (kg)', data: [], borderColor: 'rgba(255, 99, 132, 1)', fill: false, tension: 0.1 },
            { label: '體脂率 (%)', data: [], borderColor: 'rgba(54, 162, 235, 1)', fill: false, tension: 0.1, yAxisID: 'y2' },
            { label: '淨體重/95%極限 (%)', data: [], borderColor: 'rgba(255, 206, 86, 1)', fill: false, tension: 0.1, yAxisID: 'y3' }
        ]
    },
    options: {
        plugins: {
            title: { display: true, text: 'Body Planner 預測圖表' },
            tooltip: { mode: 'index', intersect: false }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
            x: { title: { display: true, text: '周數' } },
            y: { title: { display: true, text: '體重 (kg)' } },
            y2: { position: 'right', title: { display: true, text: '體脂率 (%)' }, grid: { drawOnChartArea: false } },
            y3: { position: 'right', title: { display: true, text: '淨體重/95%極限 (%)' }, grid: { drawOnChartArea: false } }
        }
    }
});

window.simulateBodyPlanner = function () {
    let currentWeight = parseFloat(weightInput.value);
    let currentBodyFat = parseFloat(bodyFatInput.value);
    let muscleLimit95 = 75 * 0.95;

    const labels = [0];
    const weights = [parseFloat(currentWeight.toFixed(2))];
    let leanMass = currentWeight * (1 - currentBodyFat / 100);
    const leanMasses = [parseFloat(leanMass.toFixed(2))];
    const bodyFats = [parseFloat(currentBodyFat.toFixed(2))];
    let progressRate = (leanMass / muscleLimit95) * 100;
    const progressRates = [parseFloat(progressRate.toFixed(2))];
    let week = 0;

    if (stages.length === 0) {
        window.updateBodyPlannerChart({ labels, weights, leanMasses, bodyFats, progressRates });
        return;
    }

    stages.forEach(stage => {
        while (true) {
            week++;
            labels.push(week);
            weights.push(parseFloat(currentWeight.toFixed(2)));
            leanMass = currentWeight * (1 - currentBodyFat / 100);
            leanMasses.push(parseFloat(leanMass.toFixed(2)));
            bodyFats.push(parseFloat(currentBodyFat.toFixed(2)));
            progressRate = (leanMass / muscleLimit95) * 100;
            progressRates.push(parseFloat(progressRate.toFixed(2)));

            let conditionMet = stage.conditionLogic === 'AND' ? true : false;

            stage.conditions.forEach(condition => {
                let valueToCheck = 0;
                if (condition.type === 'weight') valueToCheck = currentWeight;
                if (condition.type === 'bodyFat') valueToCheck = currentBodyFat;
                if (condition.type === 'progress') valueToCheck = progressRate;
                if (condition.type === 'weeks') valueToCheck = week;

                if (stage.conditionLogic === 'AND') {
                    if (!checkCondition(valueToCheck, condition.operator, condition.targetValue)) conditionMet = false;
                } else {
                    if (checkCondition(valueToCheck, condition.operator, condition.targetValue)) conditionMet = true;
                }
            });

            if (conditionMet) break;

            if (stage.restInterval > 0 && (week % stage.restInterval) < stage.restDuration) {
                // 休息期無變化
            } else {
                let weeklyChange = stage.weeklyChange;
                let muscleGain = weeklyChange * (stage.muscleRatio / 100);
                let fatGain = weeklyChange * (1 - stage.muscleRatio / 100);

                currentWeight += weeklyChange;
                let leanMassChange = muscleGain;
                let fatMassChange = fatGain;

                let totalLeanMass = currentWeight * (1 - currentBodyFat / 100) + leanMassChange;
                let totalFatMass = currentWeight * (currentBodyFat / 100) + fatMassChange;

                currentWeight = totalLeanMass + totalFatMass;
                currentBodyFat = (totalFatMass / currentWeight) * 100;
            }

            if (week > 300) break;
        }
    });

    window.updateBodyPlannerChart({ labels, weights, leanMasses, bodyFats, progressRates });
};

function checkCondition(value, operator, target) {
    if (operator === '>=') return value >= target;
    if (operator === '<=') return value <= target;
    if (operator === '=') return Math.abs(value - target) < 0.01;
    return false;
}

window.updateBodyPlannerChart = function (simulationData) {
    bodyplannerChart.data.labels = simulationData.labels;
    bodyplannerChart.data.datasets[0].data = simulationData.weights;
    bodyplannerChart.data.datasets[1].data = simulationData.leanMasses;
    bodyplannerChart.data.datasets[2].data = simulationData.bodyFats;
    bodyplannerChart.data.datasets[3].data = simulationData.progressRates;

    bodyplannerChart.update();
};
