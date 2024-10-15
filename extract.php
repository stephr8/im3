<?php

$url = "https://energy.ch/api/channels/bern/playouts";

// Initialisiert eine cURL-Sitzung
$ch = curl_init($url);

// Setzt Optionen
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Führt die cURL-Sitzung aus und erhält den Inhalt
$response = curl_exec($ch);

// Schließt die cURL-Sitzung
curl_close($ch);

// Zeigt die JSON-Antwort an
$songs = json_decode($response, true);

return $songs;



// {
//     "playFrom": "2024-10-09T10:34:13+0200",
//     "imageUrl": "https://storage.energy.ch/broadcast/covers/songs/606_1491997008.jpg",
//     "audioUrl": "https://storage.energy.ch/broadcast/hooks/606_1551490251.mp3",
//     "title": "Mirrors",
//     "artist": "Justin Timberlake"
//   }


/*
$locations = [

  {
    "latitude": 46.94,
    "longitude": 7.44,
    "generationtime_ms": 0.10597705841064453,
    "utc_offset_seconds": 7200,
    "timezone": "Europe/Zurich",
    "timezone_abbreviation": "CEST",
    "elevation": 554,
    "current_units": {
      "time": "iso8601",
      "interval": "seconds",
      "temperature_2m": "°C",
      "relative_humidity_2m": "%",
      "apparent_temperature": "°C",
      "is_day": "",
      "rain": "mm",
      "showers": "mm",
      "snowfall": "cm",
      "cloud_cover": "%"
    },
    "current": {
      "time": "2024-10-08T10:45",
      "interval": 900,
      "temperature_2m": 13.2,
      "relative_humidity_2m": 89,
      "apparent_temperature": 13.6,
      "is_day": 1,
      "rain": 0,
      "showers": 0,
      "snowfall": 0,
      "cloud_cover": 100
    }]
*/


/*
foreach ($locations as $location) {
    echo $location['latitude'] . ', ' . $location['longitude'] . "<br>";

    echo "Zeitzonen: " . $location['timezone'] . "<br>";

    echo "<br>Aktuelles Wetter:</b><br>";
    echo "Temperatur: " . $location['current']['temperature_2m'] . "°C<br>";
    echo "Luftfeuchtigkeit: " . $location['current']['relative_humidity_2m'] . "%<br>";
    echo "Gefühlte Temperatur: " . $location['current']['apparent_temperature'] . "°C<br>";
    echo "Ist es Tag: " . $location['current']['is_day'] . "<br>";
    echo "Regen: " . $location['current']['rain'] . "mm<br>";
    echo "Schauer: " . $location['current']['showers'] . "mm<br>";
    echo "Schneefall: " . $location['current']['snowfall'] . "cm<br>";
    echo "Bewölkung: " . $location['current']['cloud_cover'] . "%<br>";

    echo "------<br>";
}
*/

?>