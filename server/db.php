<?php

$host = "localhost";
$dbuser = "root";
$pass = "";
$dbname = "expense_trackerdb";

$connection = new mysqli($host, $dbuser, $pass, $dbname);

if ($connection->connect_error){
  die("Error happened");
}