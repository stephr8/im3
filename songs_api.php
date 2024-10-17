<?php

include_once 'config.php';

header('Content-Type: application/json');

if (isset($_GET['date'])) {
    $date = $_GET['date'];
} else {
    $date = date('Y-m-d H:i:s');
}

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "SELECT artist, title, playFrom, imageUrl, COUNT(*) as count
    FROM energyHits
    WHERE created BETWEEN DATE_SUB(:date, INTERVAL (WEEKDAY(:date1) -1) DAY)
      AND
      DATE_ADD(:date2, INTERVAL (7 - WEEKDAY(:date3)) DAY)
    GROUP BY artist, title
    ORDER BY playFrom";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['date' => $date, 'date1' => $date, 'date2' => $date, 'date3' => $date]);
    $songsListe = $stmt->fetchAll();


    echo json_encode($songsListe); // Gibt die Wetterdaten im JSON-Format aus
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]); // Gibt einen Fehler im JSON-Format aus, falls eine Ausnahme auftritt
}
?>