const ctx = document.getElementById("myChart");
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["یکشبنه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],
        datasets: [{
            data: [15339, 21345, 18483, 24003, 23489, 24092, 12034],
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#007bff',
            borderWidth: 4,
            pointBackgroundColor: '#007bff'
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                }
            }]
        },
        legend: {
            display: false,
        }
    }
});