let currentWeight = 80;
let currentBodyFat = 25;

function updateCurrentWeight(value) {
    currentWeight = parseFloat(value);
    document.getElementById('currentWeightDisplay').innerText = value + ' kg';
    updateBodyFatImpactChart();
}

function updateCurrentBodyFat(value) {
    currentBodyFat = parseFloat(value);
    document.getElementById('currentBodyFatDisplay').innerText = value + ' %';
    updateBodyFatImpactChart();
}

function adjustSlider(sliderId, step) {
    const slider = document.getElementById(sliderId);
    let newValue = parseFloat(slider.value) + step;

    if (newValue >= parseFloat(slider.min) && newValue <= parseFloat(slider.max)) {
        slider.value = newValue;
        
        slider.dispatchEvent(new Event('input'));
    }
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

function updateCaseyButtChart() {
    let H = parseInt(document.getElementById('heightInput').value);
    let W = parseFloat(document.getElementById('wristInput').value);
    let A = parseFloat(document.getElementById('ankleInput').value);
    let bodyFatPercent = parseFloat(document.getElementById('targetBodyFatInput').value);

    let result = calculateCaseyButtMax(H, W, A, bodyFatPercent);

    let categories = ['理論最大', '95% 現實可達'];
    let leanMass = [parseFloat(result.leanMass), parseFloat(result.realisticLeanMass)];
    let fatMass = [
        parseFloat(result.totalWeight) - parseFloat(result.leanMass),
        parseFloat(result.realisticTotalWeight) - parseFloat(result.realisticLeanMass)
    ];
    let totalWeight = [parseFloat(result.totalWeight), parseFloat(result.realisticTotalWeight)];

    let leanTrace = {
        y: categories,
        x: leanMass,
        name: '除脂體重',
        type: 'bar',
        orientation: 'h',
        text: leanMass.map(val => val.toFixed(1) + ' kg'),
        textposition: 'inside',
        insidetextanchor: 'middle',
        marker: { color: 'rgb(58,200,225)' }
    };

    let fatTrace = {
        y: categories,
        x: fatMass,
        name: '脂肪重量',
        type: 'bar',
        orientation: 'h',
        text: fatMass.map(val => val.toFixed(1) + ' kg'),
        textposition: 'inside',
        insidetextanchor: 'middle',
        marker: { color: 'rgb(255,127,14)' }
    };

    // 計算 annotations 位置
    let annotations = [];
    for (let i = 0; i < categories.length; i++) {
        annotations.push({
            x: totalWeight[i] / 2, // 總體重的一半，條形圖中心
            y: categories[i],
            text: '總體重: ' + totalWeight[i].toFixed(1) + ' kg',
            showarrow: false,
            yshift: -30, // 往下移，避免壓到條形圖
            font: { size: 14, color: 'black' }
        });
    }

    let data = [leanTrace, fatTrace];

    let layout = {
        barmode: 'stack',
        title: '肌肉潛力預測',
        xaxis: { title: '體重 (kg)' },
        yaxis: { title: '' },
        margin: { t: 50 },
        bargap: 0.5,
        annotations: annotations
    };

Plotly.react('musclePotentialChart', data, layout);
    updateBodyFatImpactChart();
}

function updateHeight(value) {
    document.getElementById('heightDisplay').innerText = value + ' cm';
    updateCaseyButtChart();
}

function updateWrist(value) {
    document.getElementById('wristDisplay').innerText = parseFloat(value).toFixed(1) + ' cm';
    updateCaseyButtChart();
}

function updateAnkle(value) {
    document.getElementById('ankleDisplay').innerText = parseFloat(value).toFixed(1) + ' cm';
    updateCaseyButtChart();
}

function updateTargetBodyFat(value) {
    document.getElementById('targetBodyFatDisplay').innerText = value + ' %';
    updateCaseyButtChart();
}

function updateBodyFatImpactChart() {
    let H = parseInt(document.getElementById('heightInput').value);
    let W = parseFloat(document.getElementById('wristInput').value);
    let A = parseFloat(document.getElementById('ankleInput').value);

    let bodyFatRange = [];
    let leanMassMax = [];
    let leanMassRealistic = [];
    let totalWeightMax = [];
    let totalWeightRealistic = [];

    let currentLeanMass = currentWeight * (1 - currentBodyFat / 100);

    for (let bf = 5; bf <= 30; bf++) {
        let result = calculateCaseyButtMax(H, W, A, bf);
        bodyFatRange.push(bf);
        leanMassMax.push(parseFloat(result.leanMass));
        leanMassRealistic.push(parseFloat(result.realisticLeanMass));
        totalWeightMax.push(parseFloat(result.totalWeight));
        totalWeightRealistic.push(parseFloat(result.realisticTotalWeight));
    }

    let trace1 = {
        x: bodyFatRange,
        y: leanMassMax,
        mode: 'lines+markers',
        name: '理論除脂體重',
        line: { color: 'rgb(58,200,225)' }
    };

    let trace2 = {
        x: bodyFatRange,
        y: leanMassRealistic,
        mode: 'lines+markers',
        name: '現實除脂體重',
        line: { color: 'rgb(0, 128, 255)', dash: 'dash' }
    };

    let trace3 = {
        x: bodyFatRange,
        y: totalWeightMax,
        mode: 'lines+markers',
        name: '理論總體重',
        line: { color: 'rgb(255,127,14)' }
    };

    let trace4 = {
        x: bodyFatRange,
        y: totalWeightRealistic,
        mode: 'lines+markers',
        name: '現實總體重',
        line: { color: 'rgb(255,0,0)', dash: 'dash' }
    };

    let currentPointTrace = {
    x: [currentBodyFat],
    y: [currentLeanMass],
    mode: 'markers+text',
    name: '目前除脂體重',
    text: ['目前除脂體重: ' + currentLeanMass.toFixed(1) + ' kg'],
    textposition: 'top center',
    marker: { color: 'green', size: 12, symbol: 'circle' }
};

let currentWeightTrace = {
    x: [currentBodyFat],
    y: [currentWeight],
    mode: 'markers+text',
    name: '目前體重',
    text: ['目前體重: ' + currentWeight.toFixed(1) + ' kg'],
    textposition: 'bottom center',
    marker: { color: 'purple', size: 12, symbol: 'diamond' }
};

    let layout = {
        title: '體脂率影響下的肌肉潛力曲線',
        xaxis: { title: '體脂率 (%)', dtick: 5 },
        yaxis: { title: '體重 (kg)', range: [0, null] } // 這裡強制 y 軸從 0 開始
    };

Plotly.react('bodyFatImpactChart', [trace1, trace2, trace3, trace4, currentPointTrace, currentWeightTrace], layout);


}

updateCaseyButtChart();
updateBodyFatImpactChart();
