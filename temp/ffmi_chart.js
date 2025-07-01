document.addEventListener('DOMContentLoaded', () => {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bodyFatInput = document.getElementById('bodyFat');
    const form = document.getElementById('userForm');

    const heightValue = document.getElementById('heightValue');
    const weightValue = document.getElementById('weightValue');
    const bodyFatValue = document.getElementById('bodyFatValue');

    let ffmiChart;

    function calculateFFMI(weight, height, bodyFat) {
        const ffm = weight * (1 - (bodyFat / 100));
        return (ffm / ((height / 100) ** 2)).toFixed(2);
    }

    function generateFFMIData() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const bodyFatRates = [];

        for (let bf = 5; bf <= 50; bf += 1) {
            bodyFatRates.push(bf);
        }

        const ffmiValues = bodyFatRates.map(bf => {
            return { x: bf, y: parseFloat(calculateFFMI(weight, height, bf)) };
        });

        return { bodyFatRates, ffmiValues };
    }

    function updateChart() {
        const { bodyFatRates, ffmiValues } = generateFFMIData();

        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const currentBodyFat = parseFloat(bodyFatInput.value);
        const currentFFMI = parseFloat(calculateFFMI(weight, height, currentBodyFat));

        const data = {
            datasets: [
                {
                    label: 'FFMI 曲線',
                    data: ffmiValues,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '目前FFMI',
                    data: [{ x: currentBodyFat, y: currentFFMI }],
                    backgroundColor: 'red',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
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
                        text: 'FFMI 與體脂率關係圖'
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: false
                    },
                    datalabels: {
                        align: 'top',
                        formatter: (value, context) => {
                            if (context.datasetIndex === 1) { // 使用者資料點
                                return `${value.y}`;
                            }
                            return '';
                        },
                        font: { weight: 'bold' },
                        color: (context) => context.datasetIndex === 1 ? 'red' : 'black'
                    }
                },
                scales: {
                    x: {
                        type: 'linear', // 這裡要加
                        title: { display: true, text: '體脂率 (%)' },
                        min: 5,
                        max: 50
                    },
                    y: {
                        title: { display: true, text: 'FFMI' },
                        beginAtZero: false
                    }
                }
            },
            plugins: [ChartDataLabels]
        };


        if (ffmiChart) {
            ffmiChart.destroy();
        }

        const ctx = document.getElementById('ffmiChart').getContext('2d');
        ffmiChart = new Chart(ctx, config);
    }

    function syncSliderValues() {
        heightValue.textContent = parseFloat(heightInput.value).toFixed(1);
        weightValue.textContent = parseFloat(weightInput.value).toFixed(1);
        bodyFatValue.textContent = parseFloat(bodyFatInput.value).toFixed(1);
    }

    syncSliderValues();
    updateChart();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updateChart();
    });

    [heightInput, weightInput, bodyFatInput].forEach(input => {
        input.addEventListener('input', () => {
            syncSliderValues();
            updateChart();
        });
    });

    window.updateFFMIChart = updateChart;
    window.syncSliderValues = syncSliderValues;
});
