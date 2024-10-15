<?php

require_once('config.php');
$data = include('transform.php');

$dataArray = json_decode($data, true);

try {
    $pdo = new PDO($dsn, $username, $password, $options);

    $stmt = $pdo->prepare("INSERT INTO energyHits (playFrom, imageUrl, audioUrl, title, artist) VALUES (?, ?, ?, ?, ?)");

    foreach ($dataArray as $data) {
        $stmt->execute([
            $data['playFrom'],
            $data['imageUrl'],
            $data['audioUrl'],
            $data['title'],
            $data['artist'],
        ]);
    }



    echo "Daten erfolgreich in die Datenbank eingefügt!";

} catch (PDOException $e) {
    die($e->getMessage());
}



?>