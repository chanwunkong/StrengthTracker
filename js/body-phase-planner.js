// body-phase-planner.js

let stages = [];
let selectedStageIndex = null;
let combinedChart;

function addStage() {
    const stage = {
        name: '階段 ' + (stages.length + 1),
        trainingLevel: '',
        goalType: 'bulking',
        weeklyCalorieDelta: 0,
        weeklyChange: 0,
        muscleRatio: 50,
        conditionLogic: 'OR',
        conditions: [],
        restInterval: 12,
        restDuration: 2
    };
    stages.push(stage);
    selectedStageIndex = stages.length - 1;
    renderStageButtons();
    loadStage();
}

function renderStageButtons() {
    const container = document.getElementById('stageButtons');
    container.innerHTML = '';
    stages.forEach((stage, index) => {
        const button = document.createElement('button');
        button.innerText = stage.name;
        button.className = index === selectedStageIndex ? 'active' : '';
        button.onclick = () => {
            selectedStageIndex = index;
            renderStageButtons();
            loadStage();
        };
        container.appendChild(button);
    });
}

function loadStage() {
    if (selectedStageIndex === null) return;
    const stage = stages[selectedStageIndex];
    document.getElementById('stageForm').style.display = 'block';
    document.getElementById('stageName').value = stage.name;
    document.getElementById('trainingLevel').value = stage.trainingLevel;
    document.getElementById('goalType').value = stage.goalType;
    document.getElementById('weeklyCalorieDelta').value = stage.weeklyCalorieDelta;
    document.getElementById('weeklyChange').value = stage.weeklyChange;
    document.getElementById('muscleRatio').value = stage.muscleRatio;
    document.getElementById('conditionLogic').value = stage.conditionLogic;
    document.getElementById('restInterval').value = stage.restInterval;
    document.getElementById('restDuration').value = stage.restDuration;
    renderConditionList();
}

function renderConditionList() {
    const container = document.getElementById('conditionList');
    container.innerHTML = '';
    const stage = stages[selectedStageIndex];
    stage.conditions.forEach((cond, idx) => {
        const div = document.createElement('div');
        div.innerHTML = `
      <label>條件: 
        <select onchange="updateCondition(${idx}, 'type', this.value)">
          <option value="bodyFatPercent" ${cond.type === 'bodyFatPercent' ? 'selected' : ''}>體脂率 (%)</option>
          <option value="leanBodyMass" ${cond.type === 'leanBodyMass' ? 'selected' : ''}>除脂體重 (kg)</option>
          <option value="weight" ${cond.type === 'weight' ? 'selected' : ''}>體重 (kg)</option>
          <option value="stageWeek" ${cond.type === 'stageWeek' ? 'selected' : ''}>階段週數</option>
        </select>
        <select onchange="updateCondition(${idx}, 'operator', this.value)">
          <option value="<=" ${cond.operator === '<=' ? 'selected' : ''}>&le;</option>
          <option value=">=" ${cond.operator === '>=' ? 'selected' : ''}>&ge;</option>
        </select>
        <input type="number" value="${cond.value}" onchange="updateCondition(${idx}, 'value', this.value)">
        <button onclick="deleteCondition(${idx})">刪除</button>
      </label><br>
    `;
        container.appendChild(div);
    });
}

function updateCondition(idx, key, value) {
    if (key === 'value') value = parseFloat(value);
    stages[selectedStageIndex].conditions[idx][key] = value;
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
    stage.trainingLevel = document.getElementById('trainingLevel').value;
    stage.goalType = document.getElementById('goalType').value;
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

function recommendCalories() {
    if (selectedStageIndex === null) return;

    const trainingLevel = document.getElementById('trainingLevel').value;
    const goalType = document.getElementById('goalType').value;

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
    document.getElementById('weeklyChange').value = recommend.weight.toFixed(2);
    document.getElementById('muscleRatio').value = recommend.muscle;
    saveStage();
}

function updateCalorieOrWeight(source) {
    if (selectedStageIndex === null) return;

    const calorieInput = document.getElementById('weeklyCalorieDelta');
    const weightInput = document.getElementById('weeklyChange');

    if (source === 'calorie') {
        let kcal = parseFloat(calorieInput.value);
        weightInput.value = (kcal / 7700).toFixed(2);
    } else if (source === 'weight') {
        let weight = parseFloat(weightInput.value);
        calorieInput.value = Math.round(weight * 7700);
    }
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
