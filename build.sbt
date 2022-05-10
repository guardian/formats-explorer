ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.8"

libraryDependencies ++= Seq(
  "com.gu" %% "content-api-client-default" % "18.0.0",
  "com.gu" %% "content-api-client" % "18.0.0",
  "com.madgag" %% "scala-collection-plus" % "0.11",
  "com.typesafe.play" %% "play-json" % "2.9.2"
)

lazy val root = (project in file("."))
  .settings(
    name := "data-format-miner"
  )
