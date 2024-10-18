const dateInput = document.getElementById('date');
dateInput.min = '2024-10-09';
const today = new Date().toISOString().split('T')[0];
dateInput.max = today;

dateInput.addEventListener('change', function () {
    getData(dateInput.value);
});

getData(today);

// Fetches the gender of an artist based on their name
async function fetchGender(name) {
    const response = await fetch(`https://api.gender.so/?name=${name}`);
    const data = await response.json();
    return data.gender || "diverse";
}

// Adds gender information to each entry in the dataset
async function addGenderToJson(myData) {
    const updatedData = await Promise.all(myData.map(async entry => {
        if (entry.gender === undefined) {
            const gender = await fetchGender(entry.artist);
            return { ...entry, gender };
        }
        return entry;
    }));
    return updatedData;
}

// Formats a date string to 'dd.mm.yy' format
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

let chart = null;
let malePlaysDataset = [];
let femalePlaysDataset = [];
let diversePlaysDataset = [];
const ctx = document.getElementById('myChart');

chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Männliche Solo Artists',
                data: malePlaysDataset,
                backgroundColor: '#556B2F',
                borderWidth: 1,
                borderRadius: 24
            },
            {
                label: 'Weibliche Solo Artists',
                data: femalePlaysDataset,
                backgroundColor: '#C71585',
                borderWidth: 1,
                borderRadius: 24
            },
            {
                label: 'Gruppen und non-binäre Solo Artists',
                data: diversePlaysDataset,
                backgroundColor: '#FF8C00',
                borderWidth: 1,
                borderRadius: 24
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 140
            }
        },
        maintainAspectRatio: false,
    }
});

// Fetches data from the API and processes it
function getData(date) {
    const apiUrl = `https://im3.stephanieroemer.ch/songs_api.php?date=${date}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(myData => {
            myData.forEach(entry => {
                if (entry.playFrom) {
                    entry.playFrom = formatDate(entry.playFrom);
                }
            });

            addGenderToJson(myData)
                .then(updatedmyData => {
                    processDataAndUpdateChart(updatedmyData);
                });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Processes the data and updates the chart
function processDataAndUpdateChart(updatedmyData) {
    const labels = [];
    const malePlaysByDay = {};
    const femalePlaysByDay = {};
    const diversePlaysByDay = {};

    updatedmyData.forEach(item => {
        const date = item.playFrom;
        if (!labels.includes(date)) {
            labels.push(date);
        }

        if (item.gender === 'male') {
            malePlaysByDay[date] = (malePlaysByDay[date] || 0) + 1;
        } else if (item.gender === 'female') {
            femalePlaysByDay[date] = (femalePlaysByDay[date] || 0) + 1;
        } else {
            diversePlaysByDay[date] = (diversePlaysByDay[date] || 0) + 1;
        }
    });

    const maleDataset = Object.values(malePlaysByDay);
    const femaleDataset = Object.values(femalePlaysByDay);
    const diverseDataset = Object.values(diversePlaysByDay);

    const playFrom = updatedmyData.map(item => item.playFrom);
    const uniqueDates = [...new Set(playFrom)];

    const totalMalePlays = maleDataset.reduce((a, b) => a + b, 0);
    const totalFemalePlays = femaleDataset.reduce((a, b) => a + b, 0);
    const totalDiversePlays = diverseDataset.reduce((a, b) => a + b, 0);

    const playCounts = [
        { gender: "Gruppen oder non-binären", count: totalDiversePlays },
        { gender: "männlichen", count: totalMalePlays },
        { gender: "weiblichen", count: totalFemalePlays }
    ];

    playCounts.sort((a, b) => b.count - a.count);

    const [topGender, middleGender, bottomGender] = playCounts.map(item => item.gender);

    updateRankingInfo(uniqueDates, topGender, middleGender, bottomGender);

    malePlaysDataset = uniqueDates.map(date => malePlaysByDay[date] || 0);
    femalePlaysDataset = uniqueDates.map(date => femalePlaysByDay[date] || 0);
    diversePlaysDataset = uniqueDates.map(date => diversePlaysByDay[date] || 0);

    chart.data.labels = labels;
    chart.data.datasets[0].data = maleDataset;
    chart.data.datasets[1].data = femaleDataset;
    chart.data.datasets[2].data = diverseDataset;
    chart.update();

    const sortedData = updatedmyData.sort((a, b) => b.count - a.count);

    updateMostPlayedInfo(uniqueDates, sortedData);
}

// Updates the ranking information displayed on the page
function updateRankingInfo(uniqueDates, topGender, middleGender, bottomGender) {
    const infoDiv = document.getElementById('info');
    let rankingDiv = document.querySelector('.genderInfo');

    if (rankingDiv) {
        rankingDiv.remove();
    }

    rankingDiv = document.createElement('div');
    rankingDiv.className = 'genderInfo';
    rankingDiv.innerHTML = `
        <h3>In der Woche vom ${uniqueDates[0]}</h3>
        <div id="rankingTop">
            <h4>${topGender === "weiblichen" ? "♀" : topGender === "männlichen" ? "♂" : " ⚥ "}</h4>
            <p>Wurde am meisten Musik von ${topGender} Solo Artists gespielt</p>
        </div>
        <div id="rankingMiddle">
            <h4>${middleGender === "weiblichen" ? "♀" : middleGender === "männlichen" ? "♂" : " ⚥ "}</h4>
            <p>Wurde viel Musik von ${middleGender} Solo Artists gespielt</p>
        </div>
        <div id="rankingBottom">
            <h4>${bottomGender === "weiblichen" ? "♀" : bottomGender === "männlichen" ? "♂" : " ⚥ "}</h4>
            <p>Wurde am wenigsten Musik von ${bottomGender} Solo Artists gespielt</p>
        </div>
    `;

    infoDiv.parentNode.appendChild(rankingDiv);
}

// Updates the most played information displayed on the page
function updateMostPlayedInfo(uniqueDates, sortedData) {
    document.getElementById('mostPlayed').innerHTML = `<h3>In der Woche vom ${uniqueDates[0]} spielte Radio Energy am meisten</h3>`;

    const topThree = document.createElement('div');
    topThree.id = 'topThree';

    const createMostPlayedDiv = (data, id) => {
        const div = document.createElement('div');
        div.className = 'mostPlayed';
        div.id = id;
        div.innerHTML = `
            <img class="songImage" src="${data.imageUrl}" alt="${data.artist}" />
            <div class="mostPlayedInfo">
                <h3>${data.title}</h3>
                <div class="artistInfo">
                    <p>${data.gender === "female" ? "♀" : data.gender === "male" ? "♂" : " ⚥ "}</p>
                    <p>${data.artist}</p>
                </div>
                <p>${data.count} Mal gespielt</p>
            </div>
        `;
        return div;
    };

    topThree.appendChild(createMostPlayedDiv(sortedData[0], 'topCount'));
    topThree.appendChild(createMostPlayedDiv(sortedData[1], 'middleCount'));
    topThree.appendChild(createMostPlayedDiv(sortedData[2], 'bottomCount'));

    document.getElementById('mostPlayed').appendChild(topThree);
}
