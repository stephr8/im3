<?php

include_once 'config.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "SELECT artist, title, COUNT(*) as count
    FROM energyHits
    WHERE created BETWEEN '2024-10-07 00:00:00' AND '2024-10-13 23:59:59'
    GROUP BY artist, title
    HAVING COUNT(*) > 1
    ORDER BY COUNT DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $songsListe = $stmt->fetchAll();


    echo json_encode($songsListe); // Gibt die Wetterdaten im JSON-Format aus
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]); // Gibt einen Fehler im JSON-Format aus, falls eine Ausnahme auftritt
}
?>