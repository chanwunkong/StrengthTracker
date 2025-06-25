function adjustSlider(sliderId, step) {
    const slider = document.getElementById(sliderId);
    let newValue = parseFloat(slider.value) + step;

    if (newValue >= parseFloat(slider.min) && newValue <= parseFloat(slider.max)) {
        slider.value = newValue;

        if (sliderId === 'heightInput') {
            updateHeight(newValue);
        } else if (sliderId === 'wristInput') {
            updateWrist(newValue);
        } else if (sliderId === 'ankleInput') {
            updateAnkle(newValue);
        } else if (sliderId === 'targetBodyFatInput') {
            updateTargetBodyFat(newValue);
        }
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

    Plotly.newPlot('musclePotentialChart', data, layout);
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

updateCaseyButtChart();
