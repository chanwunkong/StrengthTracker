
function adjustSlider(sliderId, step) {
    const slider = document.getElementById(sliderId);
    let newValue = parseFloat(slider.value) + step;

    if (newValue >= parseFloat(slider.min) && newValue <= parseFloat(slider.max)) {
        slider.value = newValue;

        if (sliderId === 'xMaxRange' || sliderId === 'yMaxRange') {
            document.getElementById(sliderId).dispatchEvent(new Event('input'));
        } else if (sliderId === 'userWeight') {
            updateUserWeight(newValue);
        } else if (sliderId === 'userRM') {
            updateUserRM(newValue);
        } else if (sliderId === 'userStrength') {
            updateUserStrength(newValue);
        } else if (sliderId === 'heightInput') {
            updateHeight(newValue);
        } else if (sliderId === 'wristInput') {
            updateWrist(newValue);
        } else if (sliderId === 'ankleInput') {
            updateAnkle(newValue);
        }
        else if (sliderId === 'targetBodyFatInput') {
            updateTargetBodyFat(newValue);
        }
    }
}

function calculateCaseyButtMax(H, W, A, bodyFatPercent, bodyWeight) {
    let fatMass = bodyWeight * (bodyFatPercent / 100);
    let leanMass = Math.pow(H, 1.5) * (Math.sqrt(W) / 322.4 + Math.sqrt(A) / 241.9) * (fatMass / 224 + 1);
    let totalBodyWeight = leanMass / (1 - bodyFatPercent / 100);
    let realisticLeanMass = leanMass * 0.95;
    let realisticTotalWeight = totalBodyWeight * 0.95;

    return {
        leanMass: leanMass.toFixed(1),
        totalWeight: totalBodyWeight.toFixed(1),
        realisticLeanMass: realisticLeanMass.toFixed(1),
        realisticTotalWeight: realisticTotalWeight.toFixed(1)
    };
}


function updateCaseyButtResult() {
    let H = parseInt(document.getElementById('heightInput').value);
    let W = parseFloat(document.getElementById('wristInput').value);
    let A = parseFloat(document.getElementById('ankleInput').value);
    let bodyFatPercent = parseFloat(document.getElementById('targetBodyFatInput').value);
    let bodyWeight = parseFloat(document.getElementById('userWeight').value);

    let result = calculateCaseyButtMax(H, W, A, bodyFatPercent, bodyWeight);

    document.getElementById('maxLeanMass').innerText = result.leanMass + ' kg';
    document.getElementById('maxBodyWeight').innerText = result.totalWeight + ' kg';
    document.getElementById('realisticLeanMass').innerText = result.realisticLeanMass + ' kg';
    document.getElementById('realisticBodyWeight').innerText = result.realisticTotalWeight + ' kg';
}


function updateHeight(value) {
    document.getElementById('heightDisplay').innerText = value + ' cm';
    updateCaseyButtResult();
}

function updateWrist(value) {
    document.getElementById('wristDisplay').innerText = parseFloat(value).toFixed(1) + ' cm';
    updateCaseyButtResult();
}

function updateAnkle(value) {
    document.getElementById('ankleDisplay').innerText = parseFloat(value).toFixed(1) + ' cm';
    updateCaseyButtResult();
}

function updateTargetBodyFat(value) {
    document.getElementById('targetBodyFatDisplay').innerText = value + ' %';
    updateCaseyButtResult();
}


function calculateCaseyButtMax(H, W, A, bodyFatPercent) {
    let leanMass = Math.pow(H, 1.5) * (Math.sqrt(W) / 322.4 + Math.sqrt(A) / 241.9) * (bodyFatPercent / 224 + 1);

    let totalBodyWeight = leanMass / (1 - bodyFatPercent / 100);

    let realisticLeanMass = leanMass * 0.95;
    let realisticTotalWeight = totalBodyWeight * 0.95;

    return {
        leanMass: leanMass.toFixed(1),
        totalWeight: totalBodyWeight.toFixed(1),
        realisticLeanMass: realisticLeanMass.toFixed(1),
        realisticTotalWeight: realisticTotalWeight.toFixed(1)
    };
}

let language = 'zh';
let unit = 'kg';

const movementParams = {
    "male": {
        "Press": { a: 0.143081, s: -0.006382, t_b: 1.175420, p: -10.000000, q: 0.000139, r: 0.523168 },
        "Bench Press": { a: 0.313917, s: -0.002640, t_b: 0.483858, p: -0.542333, q: 0.008190, r: 0.885181 },
        "Squat": { a: 0.542238, s: -0.004639, t_b: 0.839241, p: 0.094006, q: 1.000000, r: 0.207660 },
        "Deadlift": { a: 0.616152, s: -0.004511, t_b: 0.793862, p: -10.000000, q: 0.000214, r: 0.927825 },
        "Power Clean": { a: 0.272927, s: -0.006954, t_b: 1.241554, p: -0.831159, q: 0.002697, r: 0.608000 }
    },
    "female": {
        "Press": { a: 1.060079656, s: -0.00000479555, t_b: 0.016407532, p: -9.999999936, q: 0.0000283981, r: 0.344401136 },
        "Bench Press": { a: 1.156197656, s: -0.0000694985, t_b: 0.022878292, p: -9.999999992, q: 0.000181857, r: 0.591675884 },
        "Squat": { a: 0.518626596, s: -0.000598282, t_b: 0.193108691, p: -9.999999999, q: 0.000101625, r: 0.53494326 },
        "Deadlift": { a: 1.107697795, s: -0.000438779, t_b: 0.096978515, p: -9.999999985, q: 0.000191939, r: 0.685331933 },
        "Power Clean": { a: 0.372718555, s: -0.000882204, t_b: 0.208095481, p: -9.999999796, q: 0.000073921, r: 0.384703321 }
    }
};

function calculateAbsoluteStrength(t, w, params) {
    const ratio = params.a * Math.log((params.s * w + params.t_b) * t + 1) + (params.p * Math.log(params.q * w + 1) + params.r);
    return ratio * w;
}

function calculateOneRM(weight, reps) {
    return weight / (1.0278 - 0.0278 * reps);
}

function setDefaultWeight() {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const userWeight = document.getElementById('userWeight');

    if (gender === 'male') {
        userWeight.value = 70;
        document.getElementById('userWeightValue').innerText = 70;
    } else {
        userWeight.value = 55;
        document.getElementById('userWeightValue').innerText = 55;
    }
    updateChart();
}

function updateUserWeight(value) {
    document.getElementById('userWeightValue').innerText = value;
    updateCaseyButtResult();
    updateChart();
}

function updateUserRM(value) {
    document.getElementById('userRMValue').innerText = value;
    updateChart();
}

function updateUserStrength(value) {
    document.getElementById('userStrengthValue').innerText = value;
    updateChart();
}

function updateChart() {
    language = document.getElementById('languageSelect').value;
    unit = document.getElementById('unitSelect').value;

    const gender = document.querySelector('input[name="gender"]:checked').value;
    const movement = document.querySelector('input[name="movement"]:checked').value;
    const params = movementParams[gender][movement];

    let weight = parseInt(document.getElementById('userWeight').value);


    let xMax = parseInt(document.getElementById('xMaxRange').value);
    let yMax = parseInt(document.getElementById('yMaxRange').value);

    let userWeight = parseInt(document.getElementById('userWeight').value);
    let userRM = parseInt(document.getElementById('userRM').value);
    let userStrengthInput = parseFloat(document.getElementById('userStrength').value);

    if (unit === 'lb') {
        document.getElementById('userWeightUnit').innerText = 'lb';
        document.getElementById('userStrengthUnit').innerText = 'lb';
    } else {
        document.getElementById('userWeightUnit').innerText = 'kg';
        document.getElementById('userStrengthUnit').innerText = 'kg';
    }

    document.getElementById('xMaxDisplay').innerText = xMax + (language === 'zh' ? ' 月' : ' months');
    document.getElementById('yMaxDisplay').innerText = yMax + ' ' + unit;

    let xData = [];
    let yData = [];

    for (let t = 0; t <= xMax; t++) {
        let strength = calculateAbsoluteStrength(t, weight, params);
        if (unit === 'lb') strength *= 2.20462;
        xData.push(t);
        yData.push(Math.round(strength));
    }

    const trace = {
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'lines+markers',
        name: getMovementName(movement)
    };

    let userTrace = null;

    if (!isNaN(userStrengthInput) && userStrengthInput > 0 && !isNaN(userRM) && userRM > 0) {
        let weightInKg = unit === 'lb' ? userStrengthInput / 2.20462 : userStrengthInput;
        let estimatedOneRM = calculateOneRM(weightInKg, userRM);
        let displayOneRM = Math.round(unit === 'lb' ? estimatedOneRM * 2.20462 : estimatedOneRM);

        document.getElementById('oneRMValue').innerText = displayOneRM;
        document.getElementById('oneRMUnit').innerText = unit;

        let closestIndex = 0;
        let minDiff = Infinity;

        for (let i = 0; i < yData.length; i++) {
            let diff = Math.abs(yData[i] - displayOneRM);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        userTrace = {
            x: [xData[closestIndex]],
            y: [yData[closestIndex]],
            mode: 'markers+text',
            marker: { size: 12, color: 'blue' },
            text: ['1RM'],
            textposition: 'top center',
            name: language === 'zh' ? '您的 1RM 位置' : 'Your 1RM'
        };
    } else {
        document.getElementById('oneRMValue').innerText = 0;
        document.getElementById('oneRMUnit').innerText = unit;
    }

    const layout = {
        title: getChartTitle(weight, movement, gender),
        xaxis: { title: language === 'zh' ? '訓練時間（月）' : 'Training Time (Months)', range: [0, xMax] },
        yaxis: { title: language === 'zh' ? '絕對力量 (' + unit + ')' : 'Absolute Strength (' + unit + ')', range: [0, yMax] },
        shapes: [
            { type: 'line', x0: 6, y0: 0, x1: 6, y1: yMax, line: { color: 'red', dash: 'dot' } },
            { type: 'line', x0: 12, y0: 0, x1: 12, y1: yMax, line: { color: 'red', dash: 'dot' } },
            { type: 'line', x0: 24, y0: 0, x1: 24, y1: yMax, line: { color: 'red', dash: 'dot' } },
            { type: 'line', x0: 60, y0: 0, x1: 60, y1: yMax, line: { color: 'red', dash: 'dot' } }
        ],
        annotations: [
            { x: 6, y: 0, text: language === 'zh' ? '新手' : 'Beginner', showarrow: false, font: { color: 'red' }, yshift: -20 },
            { x: 12, y: 0, text: language === 'zh' ? '中級' : 'Novice', showarrow: false, font: { color: 'red' }, yshift: -20 },
            { x: 24, y: 0, text: language === 'zh' ? '高級' : 'Intermediate', showarrow: false, font: { color: 'red' }, yshift: -20 },
            { x: 60, y: 0, text: language === 'zh' ? '精英' : 'Elite', showarrow: false, font: { color: 'red' }, yshift: -20 }
        ]
    };

    if (userTrace) {
        Plotly.newPlot('chart', [trace, userTrace], layout);
    } else {
        Plotly.newPlot('chart', [trace], layout);
    }
}

function getChartTitle(weight, movement, gender) {
    let genderText = (language === 'zh') ? (gender === 'male' ? '男性' : '女性') : (gender === 'male' ? 'Male' : 'Female');
    let movementName = getMovementName(movement);
    let weightDisplay = unit === 'lb' ? Math.round(weight * 2.20462) + ' lb' : weight + ' kg';
    return language === 'zh' ?
        '體重 ' + weightDisplay + ' 的 ' + movementName + ' 力量成長曲線 (' + genderText + ')' :
        movementName + ' Strength Progression (' + genderText + ', ' + weightDisplay + ')';
}

function getMovementName(movement) {
    const names = {
        'Press': language === 'zh' ? '肩推' : 'Press',
        'Bench Press': language === 'zh' ? '臥推' : 'Bench Press',
        'Squat': language === 'zh' ? '深蹲' : 'Squat',
        'Deadlift': language === 'zh' ? '硬舉' : 'Deadlift',
        'Power Clean': language === 'zh' ? '抓舉' : 'Power Clean'
    };
    return names[movement];
}

setDefaultWeight();
updateChart();

const labels = {
    zh: {
        gender: '選擇性別:',
        male: '男性',
        female: '女性',
        movement: '選擇動作:',
        press: '肩推',
        benchPress: '臥推',
        squat: '深蹲',
        deadlift: '硬舉',
        powerClean: '抓舉',
        bodyWeight: '選擇體重:',
        xAxis: 'X 軸最大值 (月):',
        yAxis: 'Y 軸最大值:',
        userBodyWeight: '您的體重:',
        userRM: '您的 RM (次數):',
        userStrength: '您該 RM 的重量:',
        estimated1RM: '預估 1RM：',
        chartTitle: '力量成長曲線',
        beginner: '新手',
        novice: '中級',
        intermediate: '高級',
        elite: '精英'
    },
    en: {
        gender: 'Select Gender:',
        male: 'Male',
        female: 'Female',
        movement: 'Select Movement:',
        press: 'Press',
        benchPress: 'Bench Press',
        squat: 'Squat',
        deadlift: 'Deadlift',
        powerClean: 'Power Clean',
        bodyWeight: 'Body Weight:',
        xAxis: 'X Axis Max (Months):',
        yAxis: 'Y Axis Max:',
        userBodyWeight: 'Your Body Weight:',
        userRM: 'Your RM (Reps):',
        userStrength: 'Weight for Your RM:',
        estimated1RM: 'Estimated 1RM:',
        chartTitle: 'Strength Progression Chart',
        beginner: 'Beginner',
        novice: 'Novice',
        intermediate: 'Intermediate',
        elite: 'Elite'
    }
};

function updateLanguage() {
    language = document.getElementById('languageSelect').value; // 加這一行

    document.getElementById('title').innerText = labels[language].chartTitle;
    document.querySelector('label[for="male"]').innerText = labels[language].male;
    document.querySelector('label[for="female"]').innerText = labels[language].female;
    document.querySelector('.radio-group').previousElementSibling.innerText = labels[language].gender;
    document.querySelector('label[for="movementSelect"]').innerText = labels[language].movement;
    document.querySelector('label[for="press"]').innerText = labels[language]['press'];
    document.querySelector('label[for="benchPress"]').innerText = labels[language]['benchPress'];
    document.querySelector('label[for="squat"]').innerText = labels[language]['squat'];
    document.querySelector('label[for="deadlift"]').innerText = labels[language]['deadlift'];
    document.querySelector('label[for="powerClean"]').innerText = labels[language]['powerClean'];
    document.querySelector('label[for="xMaxRange"]').innerText = labels[language].xAxis;
    document.querySelector('label[for="yMaxRange"]').innerText = labels[language].yAxis;
    document.querySelector('label[for="userWeight"]').innerText = labels[language].userBodyWeight;
    document.querySelector('label[for="userRM"]').innerText = labels[language].userRM;
    document.querySelector('label[for="userStrength"]').innerText = labels[language].userStrength;
    document.getElementById('oneRMDisplay').childNodes[0].nodeValue = labels[language].estimated1RM + ' ';
}

