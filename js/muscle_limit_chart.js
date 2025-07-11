// muscle_limit_chart.js
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
        const ffmiData = [];
        const ffmi95Data = [];

        bodyFatRates.forEach(bf => {
            const leanMass = calculateLeanMass(height, wrist, ankle, bf);
            const leanMass95 = leanMass * 0.95;

            const totalWeight = leanMass / (1 - bf / 100);
            const totalWeight95 = leanMass95 / (1 - bf / 100);
            const ffmi = leanMass / Math.pow(height / 100, 2);
            const ffmi95 = leanMass95 / Math.pow(height / 100, 2);

            maxLeanMass.push({ x: bf, y: parseFloat(leanMass.toFixed(1)) });
            maxLeanMass95.push({ x: bf, y: parseFloat(leanMass95.toFixed(1)) });
            totalWeights.push({ x: bf, y: parseFloat(totalWeight.toFixed(1)) });
            totalWeights95.push({ x: bf, y: parseFloat(totalWeight95.toFixed(1)) });
            ffmiData.push({ x: bf, y: parseFloat(ffmi.toFixed(1)) });
            ffmi95Data.push({ x: bf, y: parseFloat(ffmi95.toFixed(1)) });
        });

        return { bodyFatRates, maxLeanMass, maxLeanMass95, totalWeights, totalWeights95, ffmiData, ffmi95Data };
    }

    function updateMuscleLimitChart() {
        const { bodyFatRates, maxLeanMass, maxLeanMass95, totalWeights, totalWeights95, ffmiData, ffmi95Data } = generateMuscleChartData();

        const currentBodyFat = parseFloat(bodyFatInput.value);
        const currentWeight = parseFloat(weightInput.value);
        const currentLeanMass = currentWeight * (1 - currentBodyFat / 100);
        const currentFFMI = currentLeanMass / Math.pow(parseFloat(heightInput.value) / 100, 2);

        const leanMass95AtCurrentFat = calculateLeanMass(
            parseFloat(heightInput.value),
            parseFloat(wristInput.value),
            parseFloat(ankleInput.value),
            currentBodyFat
        ) * 0.95;

        const progressPercent = (currentLeanMass / leanMass95AtCurrentFat) * 100;

        const data = {
            datasets: [
                {
                    label: '極限體重',
                    data: totalWeights,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    tension: 0.1,
                    hidden: true,
                },
                {
                    label: '95% 極限體重',
                    data: totalWeights95,
                    borderColor: 'rgba(255, 159, 192, 1)',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: '極限淨體重',
                    data: maxLeanMass,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                    tension: 0.1,
                    hidden: true,
                },
                {
                    label: '95% 極限淨體重',
                    data: maxLeanMass95,
                    borderColor: 'rgba(135, 206, 250, 1)',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: '極限 FFMI',
                    data: ffmiData,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    fill: false,
                    tension: 0.1,
                    hidden: true,
                },
                {
                    label: '95% 極限 FFMI',
                    data: ffmi95Data,
                    borderColor: 'rgba(255, 235, 150, 1)',
                    fill: false,
                },
                {
                    label: '目前體重',
                    data: [{ x: currentBodyFat, y: currentWeight }],
                    backgroundColor: 'rgba(200, 30, 80, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                },
                {
                    label: '目前淨體重',
                    data: [{ x: currentBodyFat, y: parseFloat(currentLeanMass.toFixed(1)) }],
                    backgroundColor: 'rgba(30, 120, 210, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    customPercent: progressPercent.toFixed(1),
                },
                {
                    label: '目前 FFMI',
                    data: [{ x: currentBodyFat, y: parseFloat(currentFFMI.toFixed(1)) }],
                    backgroundColor: 'rgba(204, 163, 0, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                },

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
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                const bodyFat = tooltipItems[0].label;
                                return `體脂率: ${bodyFat}%`;
                            }
                        }
                    },
                    legend: {
                        labels: { filter: (item) => true }
                    },
                    datalabels: {
                        align: 'top',
                        formatter: (value, context) => {
                            if (context.datasetIndex === 6) {
                                return `${value.y}kg`;
                            } else if (context.datasetIndex === 7) {
                                const percent = context.chart.data.datasets[7].customPercent;
                                return `${value.y}kg\n(${percent}%)`;
                            } else if (context.datasetIndex === 8) {
                                return `FFMI: ${value.y}`;
                            }
                            return '';
                        },
                        color: (context) => {
                            if (context.datasetIndex === 6) return 'rgba(255, 99, 132, 0.8)';
                            if (context.datasetIndex === 7) return 'rgba(54, 162, 235, 0.8)';
                            if (context.datasetIndex === 8) return 'rgba(255, 206, 86, 0.8)';
                            return 'black';
                        }

                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: '體脂率 (%)' },
                        min: 5,
                        max: 50
                    },
                    y: {
                        min: 0,
                        title: { display: true, text: '體重 (kg)' }
                    }
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

