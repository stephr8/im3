<?php

$songs = include('extract.php');

// $locations durchloopen, um aus den "longitude" und "latitude" Werten die korrekten Städtenamen aus einem array von lat, long Werten zu erhalten

$transformierteDaten = [];


foreach (array_slice($songs, 0, 15) as $track) {
    if (isset($track['playFrom'], $track['imageUrl'], $track['audioUrl'], $track['title'], $track['artist'])) {
        $transformierteDaten[] = [
            'playFrom' => $track['playFrom'],
            'imageUrl' => $track['imageUrl'],
            'audioUrl' => $track['audioUrl'],
            'title' => $track['title'],
            'artist' => $track['artist']
        ];
    }
}

// Die transformierten Daten in ein JSON-Format umwandeln
$jsonData = json_encode($transformierteDaten, JSON_PRETTY_PRINT);

// Ergebnis zurückgeben oder ausgeben
header('Content-Type: application/json');
return $jsonData;

?>