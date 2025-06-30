document.addEventListener('DOMContentLoaded', () => {
    const heightInput = document.getElementById('height');
    const wristInput = document.getElementById('wrist');
    const ankleInput = document.getElementById('ankle');
    const bodyFatInput = document.getElementById('bodyFat');
    const weightInput = document.getElementById('weight');

    let muscleLimitChart;

    function calculateLeanMass(height, wrist, ankle, bodyFat) {
        return Math.pow(height, 1.5) * (Math.sqrt(wrist) / 322.4 + Math.sqrt(ankle) / 241.9) * (bodyFat / 224 + 1);
    }

    function generateMuscleChartData() {
        const height = parseFloat(heightInput.value);
        const wrist = parseFloat(wristInput.value);
        const ankle = parseFloat(ankleInput.value);

        const bodyFatRates = [];
        for (let bf = 5; bf <= 50; bf += 1) {
            bodyFatRates.push(bf);
        }

        const maxLeanMass = [];
        const maxLeanMass95 = [];
        const totalWeights = [];
        const totalWeights95 = [];

        bodyFatRates.forEach(bf => {
            const leanMass = calculateLeanMass(height, wrist, ankle, bf);
            const leanMass95 = leanMass * 0.95;

            const totalWeight = leanMass / (1 - bf / 100);
            const totalWeight95 = leanMass95 / (1 - bf / 100);

            maxLeanMass.push({ x: bf, y: parseFloat(leanMass.toFixed(1)) });
            maxLeanMass95.push({ x: bf, y: parseFloat(leanMass95.toFixed(1)) });
            totalWeights.push({ x: bf, y: parseFloat(totalWeight.toFixed(1)) });
            totalWeights95.push({ x: bf, y: parseFloat(totalWeight95.toFixed(1)) });
        });

        return { bodyFatRates, maxLeanMass, maxLeanMass95, totalWeights, totalWeights95 };
    }

    function updateMuscleLimitChart() {
        const { bodyFatRates, maxLeanMass, maxLeanMass95, totalWeights, totalWeights95 } = generateMuscleChartData();

        const currentBodyFat = parseFloat(bodyFatInput.value);
        const currentWeight = parseFloat(weightInput.value);
        const currentLeanMass = currentWeight * (1 - currentBodyFat / 100);

        const leanMass95AtCurrentFat = calculateLeanMass(
            parseFloat(heightInput.value),
            parseFloat(wristInput.value),
            parseFloat(ankleInput.value),
            currentBodyFat
        ) * 0.95;

        const progressPercent = (currentLeanMass / leanMass95AtCurrentFat) * 100;

        const data = {
            labels: bodyFatRates,
            datasets: [
                {
                    label: '極限體重',
                    data: totalWeights,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '95% 極限體重',
                    data: totalWeights95,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '極限淨體重',
                    data: maxLeanMass,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '95% 極限淨體重',
                    data: maxLeanMass95,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '目前體重',
                    data: [{ x: currentBodyFat, y: currentWeight }],
                    backgroundColor: 'red',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                },
                {
                    label: '目前淨體重',
                    data: [{ x: currentBodyFat, y: parseFloat(currentLeanMass.toFixed(1)) }],
                    backgroundColor: 'blue',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    customPercent: progressPercent.toFixed(1) // 👉 額外傳遞百分比
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                animation: false,
                hover: { animationDuration: 0 },
                plugins: {
                    title: {
                        display: true,
                        text: `自然肌肉極限估算圖 (目前淨體重達成率: ${progressPercent.toFixed(1)}%)`
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: false
                    },
                    legend: {
                        labels: { filter: (item) => true }
                    },
                    datalabels: {
                        align: 'top',
                        formatter: (value, context) => {
                            if (context.datasetIndex === 4) { // 目前體重資料點
                                return `${value.y}kg`;
                            } else if (context.datasetIndex === 5) { // 目前淨體重資料點
                                const percent = context.chart.data.datasets[5].customPercent;
                                return `${value.y}kg\n(${percent}%)`;
                            }
                            return '';
                        },
                        font: { weight: 'bold' },
                        color: (context) => context.datasetIndex === 4 ? 'red' : (context.datasetIndex === 5 ? 'blue' : 'black')
                    }
                },
                scales: {
                    x: { title: { display: true, text: '體脂率 (%)' } },
                    y: { min: 40, max: 150, title: { display: true, text: '體重 (kg)' } }
                }
            },
            plugins: [ChartDataLabels]
        };

        if (muscleLimitChart) {
            muscleLimitChart.destroy();
        }

        const ctx = document.getElementById('muscleLimitChart').getContext('2d');
        muscleLimitChart = new Chart(ctx, config);
    }

    updateMuscleLimitChart();

    [heightInput, wristInput, ankleInput, bodyFatInput, weightInput].forEach(input => {
        input.addEventListener('input', () => {
            updateMuscleLimitChart();
        });
    });

    window.updateMuscleLimitChart = updateMuscleLimitChart;
});
