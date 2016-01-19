<?php
#send the csv data back to the client as json
$data = array();
if (isset($_GET["song"])) {
    $songtoget = $_GET["song"];
    $lines = file("./data/".$songtoget.".csv");
    $periods = array();
    foreach ($lines as $linenum => $line) {
        $line = trim($line);
        if ($linenum == 0) {
            $data["pps"] = (int)$line;
        } else {
            $lineargs = explode(",", $line);
            $period = array();
            for ($i = 0; $i < 6; $i++) {
                $period[] = (float)$lineargs[$i];
            }
            $periods[] = $period;
        }
    }
    $data["data"] = $periods;
} else if (isset($_GET["field"])) {
    $fieldtoget = $_GET["field"];
    $lines = file("./data/".$fieldtoget."_field.csv");
    $width = 0;
    $height = 0;
    $dx = array();
    $dy = array();
    foreach ($lines as $linenum => $line) {
        $line = trim($line);
        if ($linenum == 0) {
            $lineargs = explode(",", $line);
            $width = $lineargs[1];
            $height = $lineargs[0];
        } else {
            $lineargs = explode(",", $line);
            $row = array();
            for ($i = 0; $i < $width; $i++) {
                $row[] = (float)$lineargs[$i];
            }
            if ($linenum <= $height) {
                $dx[] = $row;
            } else {
                $dy[] = $row;
            }
        }
    }
    $data["dx"] = $dx;
    $data["dy"] = $dy;
}
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
?>
