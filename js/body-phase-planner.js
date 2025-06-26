// body-phase-planner.js

let stages = [];
let selectedStageIndex = null;
let combinedChart;

function addStage(isInitial = false) {
    const stage = {
        name: '階段 ' + (stages.length + 1),
        trainingLevel: isInitial ? 'newbie' : '',
        goalType: isInitial ? 'bulking' : '',
        weeklyCalorieDelta: isInitial ? 1155 : 0,
        weeklyChange: isInitial ? 0.15 : 0,
        muscleRatio: isInitial ? 80 : 50,
        conditionLogic: 'OR',
        conditions: [
            { type: 'bodyFatPercent', operator: '<=', value: 15 }
        ],
        restInterval: 12,
        restDuration: 2
    };

    stages.push(stage);
    selectedStageIndex = stages.length - 1;

    renderStageButtons();
    loadStage();
}




function deleteStage(index) {
    stages.splice(index, 1);

    if (selectedStageIndex >= stages.length) {
        selectedStageIndex = stages.length - 1;
    }

    if (stages.length === 0) {
        selectedStageIndex = null;
        document.getElementById('stageForm').style.display = 'none';
    }

    renderStageButtons();
    loadStage();
}

function renderStageButtons() {
    const container = document.getElementById('stageButtons');
    container.innerHTML = '';
    stages.forEach((stage, index) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'inline-block';
        buttonContainer.style.margin = '5px';

        const button = document.createElement('button');
        button.innerText = stage.name;
        button.className = index === selectedStageIndex ? 'active' : '';
        button.onclick = () => {
            selectedStageIndex = index;
            renderStageButtons();
            loadStage();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '刪除';
        deleteBtn.style.marginLeft = '5px';
        deleteBtn.onclick = () => deleteStage(index);

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(deleteBtn);
        container.appendChild(buttonContainer);
    });
}


function loadStage() {
    if (selectedStageIndex === null) return;
    const stage = stages[selectedStageIndex];

    document.getElementById('stageForm').style.display = 'block';
    document.getElementById('stageName').value = stage.name;

    // 訓練年資 radio 勾選
    const trainingRadios = document.getElementsByName('trainingLevel');
    trainingRadios.forEach(radio => {
        radio.checked = (radio.value === stage.trainingLevel);
    });

    // 目標類型 radio 勾選
    const goalRadios = document.getElementsByName('goalType');
    goalRadios.forEach(radio => {
        radio.checked = (radio.value === stage.goalType);
    });

    document.getElementById('weeklyCalorieDelta').value = stage.weeklyCalorieDelta;
    document.getElementById('weeklyCalorieDeltaDisplay').innerText = stage.weeklyCalorieDelta + ' kcal';

    document.getElementById('weeklyChange').value = stage.weeklyChange;
    document.getElementById('weeklyChangeDisplay').innerText = stage.weeklyChange + ' kg';

    document.getElementById('muscleRatio').value = stage.muscleRatio;
    document.getElementById('muscleRatioDisplay').innerText = stage.muscleRatio + ' %';

    document.getElementById('conditionLogic').value = stage.conditionLogic;

    document.getElementById('restInterval').value = stage.restInterval;
    document.getElementById('restIntervalDisplay').innerText = stage.restInterval + ' 週';

    document.getElementById('restDuration').value = stage.restDuration;
    document.getElementById('restDurationDisplay').innerText = stage.restDuration + ' 週';

    renderConditionList();
}


function renderConditionList() {
    const container = document.getElementById('conditionList');
    container.innerHTML = '';
    const stage = stages[selectedStageIndex];

    stage.conditions.forEach((cond, idx) => {
        const div = document.createElement('div');

        div.innerHTML = `
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="conditionType${idx}" value="bodyFatPercent" ${cond.type === 'bodyFatPercent' ? 'checked' : ''} onchange="updateCondition(${idx}, 'type', this.value)"> 體脂率 (%)
                </label>
                <label class="radio-option">
                    <input type="radio" name="conditionType${idx}" value="leanBodyMass" ${cond.type === 'leanBodyMass' ? 'checked' : ''} onchange="updateCondition(${idx}, 'type', this.value)"> 除脂體重 (kg)
                </label>
                <label class="radio-option">
                    <input type="radio" name="conditionType${idx}" value="weight" ${cond.type === 'weight' ? 'checked' : ''} onchange="updateCondition(${idx}, 'type', this.value)"> 體重 (kg)
                </label>
                <label class="radio-option">
                    <input type="radio" name="conditionType${idx}" value="stageWeek" ${cond.type === 'stageWeek' ? 'checked' : ''} onchange="updateCondition(${idx}, 'type', this.value)"> 階段週數
                </label>
            </div>

<div class="radio-group">
    <label class="radio-option">
        <input type="radio" name="operator${idx}" value="<=" ${cond.operator === '<=' ? 'checked' : ''} onchange="updateCondition(${idx}, 'operator', this.value)"> &le;
    </label>
    <label class="radio-option">
        <input type="radio" name="operator${idx}" value=">=" ${cond.operator === '>=' ? 'checked' : ''} onchange="updateCondition(${idx}, 'operator', this.value)"> &ge;
    </label>
</div>

            <div class="slider-group">
                <div class="slider-label">
                    <label>數值:</label>
                    <span id="conditionValueDisplay${idx}">${cond.value}</span>
                </div>
                <div class="slider-control">
                    <button onclick="adjustConditionSlider(${idx}, -1)">-</button>
                    <input type="range" id="conditionSlider${idx}" min="0" max="100" step="1" value="${cond.value}" oninput="updateConditionValue(${idx}, this.value)">
                    <button onclick="adjustConditionSlider(${idx}, 1)">+</button>
                </div>
            </div>

            <button onclick="deleteCondition(${idx})">刪除</button><br><br>
        `;

        container.appendChild(div);

        // 初始化滑桿範圍
        setConditionSliderRange(idx, cond.type);
    });
}


function setConditionSliderRange(idx, type) {
    const slider = document.getElementById('conditionSlider' + idx);
    if (!slider) return;

    if (type === 'bodyFatPercent') {
        slider.min = 5;
        slider.max = 40;
        slider.step = 1;
    } else if (type === 'leanBodyMass' || type === 'weight') {
        slider.min = 30;
        slider.max = 150;
        slider.step = 0.5;
    } else if (type === 'stageWeek') {
        slider.min = 1;
        slider.max = 54;
        slider.step = 1;
    }
}

function adjustConditionSlider(idx, delta) {
    const slider = document.getElementById('conditionSlider' + idx);
    let newValue = parseFloat(slider.value) + delta;

    if (slider.step) {
        const step = parseFloat(slider.step);
        newValue = Math.round(newValue / step) * step;
    }

    newValue = Math.max(slider.min, Math.min(slider.max, newValue));
    slider.value = newValue;
    slider.dispatchEvent(new Event('input'));
}

function updateConditionValue(idx, value) {
    document.getElementById('conditionValueDisplay' + idx).innerText = value;
    updateCondition(idx, 'value', value);
}



function updateCondition(idx, key, value) {
    if (key === 'value') value = parseFloat(value);
    stages[selectedStageIndex].conditions[idx][key] = value;

    if (key === 'type') {
        setConditionSliderRange(idx, value);
    }
}

function addCondition() {
    stages[selectedStageIndex].conditions.push({ type: 'bodyFatPercent', operator: '<=', value: 15 });
    renderConditionList();
}

function deleteCondition(idx) {
    stages[selectedStageIndex].conditions.splice(idx, 1);
    renderConditionList();
}

function saveStage() {
    if (selectedStageIndex === null) return;
    const stage = stages[selectedStageIndex];
    stage.name = document.getElementById('stageName').value;

    stage.trainingLevel = getSelectedRadioValue('trainingLevel');
    stage.goalType = getSelectedRadioValue('goalType');

    stage.weeklyCalorieDelta = parseFloat(document.getElementById('weeklyCalorieDelta').value);
    stage.weeklyChange = parseFloat(document.getElementById('weeklyChange').value);
    stage.muscleRatio = parseFloat(document.getElementById('muscleRatio').value);
    stage.conditionLogic = document.getElementById('conditionLogic').value;
    stage.restInterval = parseInt(document.getElementById('restInterval').value);
    stage.restDuration = parseInt(document.getElementById('restDuration').value);

    renderStageButtons();
}


function recommendValues() {
    recommendCalories();
}

function getSelectedRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (const radio of radios) {
        if (radio.checked) return radio.value;
    }
    return '';
}

function recommendValues() {
    const trainingLevel = getSelectedRadioValue('trainingLevel');
    const goalType = getSelectedRadioValue('goalType');

    const calorieTable = {
        bulking: {
            newbie: { calorie: 1155, weight: 0.15, muscle: 80 },
            intermediate: { calorie: 770, weight: 0.10, muscle: 60 },
            advanced: { calorie: 385, weight: 0.05, muscle: 50 },
            expert: { calorie: 231, weight: 0.03, muscle: 30 }
        },
        cutting: {
            newbie: { calorie: -5775, weight: -0.75, muscle: 15 },
            intermediate: { calorie: -4620, weight: -0.60, muscle: 20 },
            advanced: { calorie: -3850, weight: -0.50, muscle: 25 },
            expert: { calorie: -3080, weight: -0.40, muscle: 30 }
        },
        maintenance: {
            newbie: { calorie: 0, weight: 0, muscle: 50 },
            intermediate: { calorie: 0, weight: 0, muscle: 50 },
            advanced: { calorie: 0, weight: 0, muscle: 50 },
            expert: { calorie: 0, weight: 0, muscle: 50 }
        }
    };

    if (!trainingLevel || !goalType) return;

    const recommend = calorieTable[goalType][trainingLevel];

    document.getElementById('weeklyCalorieDelta').value = recommend.calorie;
    document.getElementById('weeklyChange').value = recommend.weight;
    document.getElementById('muscleRatio').value = recommend.muscle;

    document.getElementById('weeklyCalorieDeltaDisplay').innerText = recommend.calorie + ' kcal';
    document.getElementById('weeklyChangeDisplay').innerText = recommend.weight + ' kg';
    document.getElementById('muscleRatioDisplay').innerText = recommend.muscle + ' %';

    updateCalorieOrWeight('calorie');
    saveStage();
}

function updateMuscleRatio(value) {
    document.getElementById('muscleRatioDisplay').innerText = value + ' %';
    saveStage();
}

function updateCalorieOrWeight(source) {
    const calorieInput = document.getElementById('weeklyCalorieDelta');
    const weightInput = document.getElementById('weeklyChange');

    if (source === 'calorie') {
        let kcal = parseFloat(calorieInput.value);
        document.getElementById('weeklyCalorieDeltaDisplay').innerText = kcal + ' kcal';

        let weight = kcal / 7700;
        weightInput.value = weight.toFixed(2);
        document.getElementById('weeklyChangeDisplay').innerText = weight.toFixed(2) + ' kg';
    } else if (source === 'weight') {
        let weight = parseFloat(weightInput.value);
        document.getElementById('weeklyChangeDisplay').innerText = weight + ' kg';

        let kcal = Math.round(weight * 7700);
        calorieInput.value = kcal;
        document.getElementById('weeklyCalorieDeltaDisplay').innerText = kcal + ' kcal';
    }

    saveStage();
}


function adjustSlider(id, delta) {
    const slider = document.getElementById(id);
    let newValue = parseFloat(slider.value) + delta;

    if (slider.step) {
        const step = parseFloat(slider.step);
        newValue = Math.round(newValue / step) * step;
    }

    newValue = Math.max(slider.min, Math.min(slider.max, newValue));
    slider.value = newValue;

    // 強制觸發滑桿事件
    slider.dispatchEvent(new Event('input'));

    // 根據滑桿 id 決定更新哪個顯示文字
    if (id === 'weeklyCalorieDelta') {
        updateWeeklyCalorieDelta(newValue);
    } else if (id === 'weeklyChange') {
        updateWeeklyChange(newValue);
    } else if (id === 'muscleRatio') {
        updateMuscleRatio(newValue);
    } else if (id === 'startWeight') {
        updateStartWeight(newValue);
    } else if (id === 'startBodyFat') {
        updateStartBodyFat(newValue);
    } else if (id === 'restInterval') {
        updateRestInterval(newValue);
    } else if (id === 'restDuration') {
        updateRestDuration(newValue);
    }
}


function updateWeeklyCalorieDelta(value) {
    document.getElementById('weeklyCalorieDeltaDisplay').innerText = value + ' kcal';
    document.getElementById('weeklyCalorieDelta').value = value;

    let weight = value / 7700;
    document.getElementById('weeklyChange').value = weight.toFixed(2);
    document.getElementById('weeklyChangeDisplay').innerText = weight.toFixed(2) + ' kg';

    saveStage();
}

function updateWeeklyChange(value) {
    document.getElementById('weeklyChangeDisplay').innerText = parseFloat(value).toFixed(2) + ' kg';
    document.getElementById('weeklyChange').value = value;

    let kcal = Math.round(value * 7700);
    document.getElementById('weeklyCalorieDelta').value = kcal;
    document.getElementById('weeklyCalorieDeltaDisplay').innerText = kcal + ' kcal';

    saveStage();
}

function updateMuscleRatio(value) {
    document.getElementById('muscleRatioDisplay').innerText = value + ' %';
    document.getElementById('muscleRatio').value = value;

    saveStage();
}

function updateStartWeight(value) {
    document.getElementById('startWeightDisplay').innerText = value + ' kg';
    document.getElementById('startWeight').value = value;
}

function updateStartBodyFat(value) {
    document.getElementById('startBodyFatDisplay').innerText = value + ' %';
    document.getElementById('startBodyFat').value = value;
}

function updateRestInterval(value) {
    document.getElementById('restIntervalDisplay').innerText = value + ' 週';
    document.getElementById('restInterval').value = value;

    saveStage();
}

function updateRestDuration(value) {
    document.getElementById('restDurationDisplay').innerText = value + ' 週';
    document.getElementById('restDuration').value = value;

    saveStage();
}


function calculate() {
    const startWeight = parseFloat(document.getElementById('startWeight').value);
    const startBodyFat = parseFloat(document.getElementById('startBodyFat').value);

    let weight = startWeight;
    let bodyFatPercent = startBodyFat;
    let leanBodyMass = weight * (1 - bodyFatPercent / 100);

    let resultRows = [{ week: 0, weight: weight.toFixed(2), leanBodyMass: leanBodyMass.toFixed(2), bodyFatPercent: bodyFatPercent.toFixed(2), stage: '初始' }];
    let week = 0;
    let stageChangePoints = [];

    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const restInterval = stage.restInterval;
        const restDuration = stage.restDuration;

        let stageWeek = 0;

        while (true) {
            week++;
            stageWeek++;

            if (restInterval > 0 && (stageWeek - 1) % (restInterval + restDuration) >= restInterval && restDuration > 0) {
                resultRows.push({ week, weight: weight.toFixed(2), leanBodyMass: leanBodyMass.toFixed(2), bodyFatPercent: bodyFatPercent.toFixed(2), stage: '休息期' });
                continue;
            }

            const weightChange = stage.weeklyChange;
            const muscleChange = weightChange * (stage.muscleRatio / 100);
            weight += weightChange;
            leanBodyMass += muscleChange;
            let fatMass = weight - leanBodyMass;
            bodyFatPercent = (fatMass / weight) * 100;

            resultRows.push({ week, weight: weight.toFixed(2), leanBodyMass: leanBodyMass.toFixed(2), bodyFatPercent: bodyFatPercent.toFixed(2), stage: stage.name });

            const conditions = stage.conditions.map(cond => {
                let currentValue = 0;
                if (cond.type === 'bodyFatPercent') currentValue = bodyFatPercent;
                if (cond.type === 'leanBodyMass') currentValue = leanBodyMass;
                if (cond.type === 'weight') currentValue = weight;
                if (cond.type === 'stageWeek') currentValue = stageWeek;

                return cond.operator === '<=' ? currentValue <= cond.value : currentValue >= cond.value;
            });

            const isComplete = stage.conditionLogic === 'AND' ? conditions.every(c => c) : conditions.some(c => c);

            if (isComplete) {
                stageChangePoints.push({
                    week,
                    weight: weight.toFixed(2),
                    bodyFatPercent: bodyFatPercent.toFixed(2),
                    leanBodyMass: leanBodyMass.toFixed(2),
                    stage: stage.name
                });
                break;
            }
            if (week > 500) { alert('計算超過 500 週，請檢查設定。'); break; }
        }
    }

    displayResults(resultRows);
    drawCombinedChart(resultRows, stageChangePoints);
}

function displayResults(rows) {
    let html = '<h3>結果表格</h3><table><tr><th>週數</th><th>體重 (kg)</th><th>除脂體重 (kg)</th><th>體脂率 (%)</th><th>階段</th></tr>';

    rows.forEach(row => {
        html += `<tr><td>${row.week}</td><td>${row.weight}</td><td>${row.leanBodyMass}</td><td>${row.bodyFatPercent}</td><td>${row.stage}</td></tr>`;
    });

    html += '</table>';
    document.getElementById('results').innerHTML = html;
}

function drawCombinedChart(rows, stageChangePoints) {
    const labels = rows.map(r => r.week);
    const weights = rows.map(r => parseFloat(r.weight));
    const bodyFats = rows.map(r => parseFloat(r.bodyFatPercent));
    const lbms = rows.map(r => parseFloat(r.leanBodyMass));

    if (combinedChart) combinedChart.destroy();

    const colors = ['purple', 'orange', 'teal', 'brown', 'gray'];
    let annotations = {};

    stageChangePoints.forEach((point, index) => {
        const color = colors[index % colors.length];

        annotations[`vline${index}`] = {
            type: 'line',
            xMin: point.week,
            xMax: point.week,
            borderColor: color,
            borderWidth: 2,
            label: {
                content: `週 ${point.week}`,
                enabled: true,
                position: 'start',
                backgroundColor: color,
                color: 'white'
            }
        };

        annotations[`weight${index}`] = {
            type: 'point',
            xValue: point.week,
            yValue: parseFloat(point.weight),
            backgroundColor: 'blue',
            radius: 5,
            label: {
                content: `體重: ${point.weight}`,
                enabled: true,
                position: 'center'
            }
        };

        annotations[`fat${index}`] = {
            type: 'point',
            xValue: point.week,
            yValue: parseFloat(point.bodyFatPercent),
            backgroundColor: 'red',
            radius: 5,
            label: {
                content: `體脂: ${point.bodyFatPercent}`,
                enabled: true,
                position: 'center'
            }
        };

        annotations[`lbm${index}`] = {
            type: 'point',
            xValue: point.week,
            yValue: parseFloat(point.leanBodyMass),
            backgroundColor: 'green',
            radius: 5,
            label: {
                content: `除脂: ${point.leanBodyMass}`,
                enabled: true,
                position: 'center'
            }
        };
    });

    const ctx = document.getElementById('combinedChart').getContext('2d');
    combinedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: '體重 (kg)', data: weights, fill: false, borderColor: 'blue' },
                { label: '體脂率 (%)', data: bodyFats, fill: false, borderColor: 'red' },
                { label: '除脂體重 (kg)', data: lbms, fill: false, borderColor: 'green' }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            stacked: false,
            plugins: {
                title: { display: true, text: '體重 / 體脂率 / 除脂體重 變化圖' },
                annotation: {
                    annotations: annotations
                }
            },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true, title: { display: true, text: '單位混合 (kg / %)' } }
            }
        }
    });
}

window.onload = function() {
    if (stages.length === 0) {
        addStage(true);
    }
    recommendValues();
    saveStage();
    calculate();
};