// js/muscle-potential.js

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

function updateCaseyButtResult() {
    let H = parseInt(document.getElementById('heightInput').value);
    let W = parseFloat(document.getElementById('wristInput').value);
    let A = parseFloat(document.getElementById('ankleInput').value);
    let bodyFatPercent = parseFloat(document.getElementById('targetBodyFatInput').value);

    let result = calculateCaseyButtMax(H, W, A, bodyFatPercent);

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

updateCaseyButtResult();
