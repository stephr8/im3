const dateInput = document.getElementById('date');
dateInput.min = '2024-10-09';
// Set the maximum date to today's date
const today = new Date().toISOString().split('T')[0];
dateInput.max = today;
dateInput.addEventListener('change', function () {
    console.log(dateInput.value);
    getData(dateInput.value);
});

//Function to jump one week back or to the future, if users click on the button prevWeek or nextWeek respectively
function changeWeek(direction) {
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + direction * 7);
    dateInput.value = date.toISOString().split('T')[0];
    getData(dateInput.value);
}





console.log(today);

getData(today);

// Function to get gender from Genderize API
async function fetchGender(name) {
    const response = await fetch(`https://api.gender.so/?name=${name}`);
    const data = await response.json();
    return data.gender || "diverse"; // Return gender or null if not found
}

// Function to update JSON with gender
async function addGenderToJson(myData) {
    const updatedData = [];

    for (const entry of myData) {
        if (entry.gender === undefined) { // Check if gender is undefined
            const gender = await fetchGender(entry.artist); // Fetch gender
            updatedData.push({ ...entry, gender }); // Add gender to the entry
        } else {
            updatedData.push(entry); // If gender exists, push the entry as is
        }
    }

    return updatedData; // Return the updated JSON data
}

// Function to format playFrom date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Create the chart
let chart = null
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

// Function to fetch data from API
// Function to fetch data from API
function getData(date) {
    const apiUrl = "https://im3.stephanieroemer.ch/songs_api.php?date=" + date;
    console.log(apiUrl);

    fetch(apiUrl)
        .then(response => response.json())
        .then((myData) => {
            // Update playFrom date format in JSON data
            myData.forEach(entry => {
                if (entry.playFrom) {
                    entry.playFrom = formatDate(entry.playFrom);
                }
            });

            // Using the function
            addGenderToJson(myData)
                .then(updatedmyData => {
                    console.log(updatedmyData); // Output the updated JSON with gender

                    // Process data and update chart
                    processDataAndUpdateChart(updatedmyData);
                });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to process data and update chart
function processDataAndUpdateChart(updatedmyData) {
    const labels = [];
    const malePlaysByDay = {};
    const femalePlaysByDay = {};
    const diversePlaysByDay = {};

    // Count plays
    updatedmyData.forEach(item => {
        const date = item.playFrom;
        if (!labels.includes(date)) {
            labels.push(date);
        }

        if (item.gender === 'male') {
            if (!malePlaysByDay[date]) {
                malePlaysByDay[date] = 0;
            }
            malePlaysByDay[date]++;
        }

        if (item.gender === 'female') {
            if (!femalePlaysByDay[date]) {
                femalePlaysByDay[date] = 0;
            }
            femalePlaysByDay[date]++;
        }

        if (item.gender === 'diverse') {
            if (!diversePlaysByDay[date]) {
                diversePlaysByDay[date] = 0;
            }
            diversePlaysByDay[date]++;
        }
    });

    const maleDataset = Object.values(malePlaysByDay);
    const femaleDataset = Object.values(femalePlaysByDay);
    const diverseDataset = Object.values(diversePlaysByDay);

    console.log('maleDataset', maleDataset);
    console.log('femaleDataset', femaleDataset);
    console.log('diverseDataset', diverseDataset);

    // Get unique dates from playFrom
    const playFrom = updatedmyData.map((item) => item.playFrom);

    // Calculate total plays for each gender
    const totalMalePlays = maleDataset.reduce((a, b) => a + b, 0);
    const totalFemalePlays = femaleDataset.reduce((a, b) => a + b, 0);
    const totalDiversePlays = diverseDataset.reduce((a, b) => a + b, 0);

    const playCounts = [
        { gender: "Gruppen oder non-binären", count: totalDiversePlays },
        { gender: "männlichen", count: totalMalePlays },
        { gender: "weiblichen", count: totalFemalePlays }
    ];

    // Sort playCounts by count in descending order
    playCounts.sort((a, b) => b.count - a.count);

    // Assign top, middle, and bottom genders
    const topGender = playCounts[0].gender;
    const middleGender = playCounts[1].gender;
    const bottomGender = playCounts[2].gender;

    // Get unique dates from playFrom
    const uniqueDates = [...new Set(playFrom)];

    updateRankingInfo(uniqueDates, topGender, middleGender, bottomGender);

    // Create datasets for male, female, and diverse plays by day
    malePlaysDataset = uniqueDates.map(date => malePlaysByDay[date] || 0);
    femalePlaysDataset = uniqueDates.map(date => femalePlaysByDay[date] || 0);
    diversePlaysDataset = uniqueDates.map(date => diversePlaysByDay[date] || 0);

    // Update chart data
    chart.data.labels = labels;
    chart.data.datasets[0].data = maleDataset;
    chart.data.datasets[1].data = femaleDataset;
    chart.data.datasets[2].data = diverseDataset;
    chart.update();

    // Sort the updated data by play count in descending order
    const sortedData = updatedmyData.sort((a, b) => b.count - a.count);

    updateMostPlayedInfo(uniqueDates, sortedData);

    // Log the top three entries
    console.log('Top 3 entries with the most counts:');
    console.log(sortedData.slice(0, 3));
}

// Function to update ranking info
function updateRankingInfo(uniqueDates, topGender, middleGender, bottomGender) {
    const infoDiv = document.getElementById('info');
    let rankingDiv = document.querySelector('.genderInfo');

    // If the rankingDiv already exists, remove it
    if (rankingDiv) {
        rankingDiv.remove();
    }

    // Create the div and its content
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

    // Append the ranking div next to the chart
    infoDiv.parentNode.appendChild(rankingDiv);
}

// Function to update most played info
function updateMostPlayedInfo(uniqueDates, sortedData) {
    document.getElementById('mostPlayed').innerHTML = `<h3>In der Woche vom ${uniqueDates[0]} spielte Radio Energy am meisten</h3>`;

    // Create divs for the top 3 songs with the most counts
    const topThree = document.createElement('div');
    topThree.id = 'topThree';

    const topCount = document.createElement('div');
    topCount.id = 'topCount';
    topCount.innerHTML = `
        <img class="songImage" src="${sortedData[0].imageUrl}" alt="${sortedData[0].artist}" />
        <h3>${sortedData[0].title}</h3>
        <p>${sortedData[0].artist}</p>
        <p>${sortedData[0].count} Mal gespielt</p>
    `;

    const middleCount = document.createElement('div');
    middleCount.id = 'middleCount';
    middleCount.innerHTML = `
        <img class="songImage" src="${sortedData[1].imageUrl}" alt="${sortedData[1].artist}" />
        <h3>${sortedData[1].title}</h3>
        <p>${sortedData[1].artist}</p>
        <p>${sortedData[1].count} Mal gespielt</p>
    `;

    const bottomCount = document.createElement('div');
    bottomCount.id = 'bottomCount';
    bottomCount.innerHTML = `
        <img class="songImage" src="${sortedData[2].imageUrl}" alt="${sortedData[2].artist}" />
        <h3>${sortedData[2].title}</h3>
        <p>${sortedData[2].artist}</p>
        <p>${sortedData[2].count} Mal gespielt</p>
    `;

    topThree.appendChild(topCount);
    topThree.appendChild(middleCount);
    topThree.appendChild(bottomCount);

    

    // Append the topThree div to the mostPlayed div
    const mostPlayedDiv = document.getElementById('mostPlayed');
    mostPlayedDiv.appendChild(topThree);
}

    // Append the divs to the mostPlayed div
    /* const mostPlayedDiv = document.getElementById('mostPlayed');
    mostPlayedDiv.appendChild(topCount);
    mostPlayedDiv.appendChild(middleCount);
    mostPlayedDiv.appendChild(bottomCount);
} */
