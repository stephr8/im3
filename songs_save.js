const dateInput = document.getElementById('date');
dateInput.addEventListener('change', function () {
    console.log(dateInput.value);
    getData(dateInput.value);
});

// Get the current date as timestamp
const today = new Date().toISOString().replace(/[TZtz]/g, ' ').trim().split('.')[0];

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
                label: 'Männliche Artists',
                data: malePlaysDataset,
                borderWidth: 1
            },
            {
                label: 'Weibliche Artists',
                data: femalePlaysDataset,
                borderWidth: 1
            },
            {
                label: 'Gruppen und non-binäre Artists',
                data: diversePlaysDataset,
                borderWidth: 1
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 200 // Set the maximum height to 200
            }
        },
        maintainAspectRatio: false,
    }
});

// Function to fetch data from API
function getData(date) {

    const apiUrl = "https://im3.stephanieroemer.ch/songs_api.php?date=" + date;
    console.log(apiUrl);

    fetch(apiUrl)
        .then(response => response.json())
        .then((myData) => {

            // Update playFrom date format in JSON data
            let musicLabels = [];
            myData.forEach(entry => {
                if (entry.playFrom) {
                    entry.playFrom = formatDate(entry.playFrom);
                    musicLabels.push(entry.playFrom);
                }
            });
            

            // Using the function
            addGenderToJson(myData)
                .then(updatedmyData => {
                    console.log(updatedmyData); // Output the updated JSON with gender

                    // Split the counts into three separate arrays for male, female, and diverse plays for each day
                    const labels = [];
                    const malePlaysByDay = [];
                    const femalePlaysByDay = [];
                    const diversePlaysByDay = [];


                    // Count plays
                    updatedmyData.forEach(item => {
                        const date = item.playFrom;
                        if (!labels.includes(date)) {
                            labels.push(date);
                        }

                        if (item.gender === 'male'){
                            if (!malePlaysByDay[date]) {
                                malePlaysByDay[date] = 0;
                            }
                            malePlaysByDay[date]++;
                        }

                        if (item.gender === 'female'){
                            if (!femalePlaysByDay[date]) {
                                femalePlaysByDay[date] = 0;
                            }
                            femalePlaysByDay[date]++;
                        }

                        if (item.gender === 'diverse'){
                            if (!diversePlaysByDay[date]) {
                                diversePlaysByDay[date] = 0;
                            }
                            diversePlaysByDay[date]++;
                        }
                    });

                    
                    let maleDataset = [];
                    let femaleDataset = [];
                    let diverseDataset = [];


                    for (const [key, value] of Object.entries(malePlaysByDay)) {
                        console.log(`${key}: ${value}`);
                        maleDataset.push(value);
                      }


                    for (const [key, value] of Object.entries(femalePlaysByDay)) {
                        console.log(`${key}: ${value}`);
                        femaleDataset.push(value);
                      }


                    for (const [key, value] of Object.entries(diversePlaysByDay)) {
                        console.log(`${key}: ${value}`);
                        diverseDataset.push(value);
                      }

                    console.log('maleDataset', maleDataset);
                    console.log('femaleDataset', femaleDataset);
                    console.log('diverseDataset', diverseDataset);

                    // Get unique dates from playFrom
                    let playFrom = updatedmyData.map((item) => item.playFrom);

                    /* const maleArtists = updatedmyData.filter(item => item.gender === 'male');
                    const malePlayed = maleArtists.map(item => item.playFrom);
                    const femaleArtists = updatedmyData.filter(item => item.gender === 'female');
                    const femalePlayed = femaleArtists.map(item => item.playFrom);
                    const diverseArtists = updatedmyData.filter(item => item.gender === 'diverse');
                    const diversePlayed = diverseArtists.map(item => item.playFrom); */

                    // Calculate total plays for each gender
                    const totalMalePlays = Object.values(malePlaysByDay).reduce((a, b) => a + b, 0);
                    const totalFemalePlays = Object.values(femalePlaysByDay).reduce((a, b) => a + b, 0);
                    const totalDiversePlays = Object.values(diversePlaysByDay).reduce((a, b) => a + b, 0);

                    // Determine the highest, middle, and lowest play counts
                    /* let topGender = "???";
                    let middleGender = "???";
                    let bottomGender = "???"; */

                    const playCounts = [
                        { gender: "Gruppen oder non-binären", count: totalDiversePlays },
                        { gender: "männlichen", count: totalMalePlays },
                        { gender: "weiblichen", count: totalFemalePlays }
                    ];

                    // Sort playCounts by count in descending order
                    playCounts.sort((a, b) => b.count - a.count);

                    // Assign top, middle, and bottom genders
                    topGender = playCounts[0].gender;
                    middleGender = playCounts[1].gender;
                    bottomGender = playCounts[2].gender;

                    // Get unique dates from playFrom
                    const uniqueDates = [...new Set(playFrom)];

                    const infoDiv = document.getElementById('info');
                    // Create the div and its content
                    const rankingDiv = document.createElement('div');
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

                    // Create datasets for male, female, and diverse plays by day
                    malePlaysDataset = uniqueDates.map(date => malePlaysByDay[date] || 0);
                    femalePlaysDataset = uniqueDates.map(date => femalePlaysByDay[date] || 0);
                    diversePlaysDataset = uniqueDates.map(date => diversePlaysByDay[date] || 0);


                    // Update chart with filtered data
                   /*  const filteredMalePlaysByDay = [];
                    const filteredFemalePlaysByDay = [];
                    const filteredDiversePlaysByDay = []; */

                   /* filteredData.forEach(item => {
                        const date = item.playFrom;
                        if (!filteredMalePlaysByDay[date]) {
                            filteredMalePlaysByDay[date] = 0;
                        }
                        if (!filteredFemalePlaysByDay[date]) {
                            filteredFemalePlaysByDay[date] = 0;
                        }
                        if (!filteredDiversePlaysByDay[date]) {
                            filteredDiversePlaysByDay[date] = 0;
                        }

                        if (item.gender === 'male') {
                            filteredMalePlaysByDay[date]++;
                        } else if (item.gender === 'female') {
                            filteredFemalePlaysByDay[date]++;
                        } else if (item.gender === 'diverse') {
                            filteredDiversePlaysByDay[date]++;
                        }
                    });
*/
                   /*  const filteredMalePlaysDataset = uniqueDates.map(date => filteredMalePlaysByDay[date] || 0);
                    const filteredFemalePlaysDataset = uniqueDates.map(date => filteredFemalePlaysByDay[date] || 0);
                    const filteredDiversePlaysDataset = uniqueDates.map(date => filteredDiversePlaysByDay[date] || 0);
                    console.log('filteredMalePlaysDataset', filteredMalePlaysDataset); */


                    // Update chart data
                    chart.data.labels = labels;
                    chart.data.datasets[0].data = maleDataset;
                    chart.data.datasets[1].data = femaleDataset;
                    chart.data.datasets[2].data = diverseDataset;
                    console.log('filteredMalePlaysDataset::::::::::');
                    chart.update();
                });


        })
        .catch(error => console.error('Error fetching data:', error));
}
