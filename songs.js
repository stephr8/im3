const apiUrl = "https://im3.stephanieroemer.ch/songs_api.php";

getData();

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

function getData() {

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

                    // Split the counts into three separate arrays for male, female, and diverse plays for each day
                    const malePlaysByDay = [];
                    const femalePlaysByDay = [];
                    const diversePlaysByDay = [];

                    updatedmyData.forEach(item => {
                        const date = item.playFrom;
                        if (!malePlaysByDay[date]) {
                            malePlaysByDay[date] = 0;
                        }
                        if (!femalePlaysByDay[date]) {
                            femalePlaysByDay[date] = 0;
                        }
                        if (!diversePlaysByDay[date]) {
                            diversePlaysByDay[date] = 0;
                        }

                        if (item.gender === 'male') {
                            malePlaysByDay[date]++;
                        } else if (item.gender === 'female') {
                            femalePlaysByDay[date]++;
                        } else if (item.gender === 'diverse') {
                            diversePlaysByDay[date]++;
                        }
                    });

                    console.log(malePlaysByDay);



                    let title = updatedmyData.map((item) => item.title);
                    let artist = updatedmyData.map((item) => item.artist);
                    let count = updatedmyData.map((item) => item.count);
                    let gender = updatedmyData.map((item) => item.gender);
                    let playFrom = updatedmyData.map((item) => item.playFrom);

                    const maleArtists = updatedmyData.filter(item => item.gender === 'male');
                    const malePlayed = maleArtists.map(item => item.playFrom);
                    const femaleArtists = updatedmyData.filter(item => item.gender === 'female');
                    const femalePlayed = femaleArtists.map(item => item.playFrom);
                    const diverseArtists = updatedmyData.filter(item => item.gender === 'diverse');
                    const diversePlayed = diverseArtists.map(item => item.playFrom);


                    const ctx = document.getElementById('myChart');

                    // Calculate total plays for each gender
                    const totalMalePlays = Object.values(malePlaysByDay).reduce((a, b) => a + b, 0);
                    const totalFemalePlays = Object.values(femalePlaysByDay).reduce((a, b) => a + b, 0);
                    const totalDiversePlays = Object.values(diversePlaysByDay).reduce((a, b) => a + b, 0);

                    // Determine the highest, middle, and lowest play counts
                    let topGender = "???";
                    let middleGender = "???";
                    let bottomGender = "???";

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
                        <p>Wurde am meisten Musik von ${topGender} Artists gespielt</p>
                    </div>
                    <div id="rankingMiddle">
                        <p>Wurde viel Musik von ${middleGender} Artists gespielt</p>
                    </div>
                    <div id="rankingBottom">
                        <p>Wurde am wenigsten Musik von ${bottomGender} Artists gespielt</p>
                    </div>
                `;

                    // Append the ranking div next to the chart
                    infoDiv.parentNode.appendChild(rankingDiv);




                    // Create datasets for male, female, and diverse plays by day
                    const malePlaysDataset = uniqueDates.map(date => malePlaysByDay[date] || 0);
                    const femalePlaysDataset = uniqueDates.map(date => femalePlaysByDay[date] || 0);
                    const diversePlaysDataset = uniqueDates.map(date => diversePlaysByDay[date] || 0);

                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: uniqueDates,
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
                });
        })
        .catch(error => console.error('Error fetching data:', error));

}

