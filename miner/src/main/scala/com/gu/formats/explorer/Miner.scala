package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.utils.format.{Design, Display, Theme}
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}
import com.madgag.scala.collection.decorators._
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

import java.time.Instant
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class ContentFormatData(
  format: Format,
  webUrl: String,
)

object ContentFormatData {
  implicit val ContentFormatDataWrites: OWrites[ContentFormatData] = Json.writes[ContentFormatData]
}


case class Format(
  theme: Theme,
  design: Design,
  display: Display
)

object Format {
  implicit val ThemeWrites: Writes[Theme] = (o: Theme) => JsString(o.toString)
  implicit val DesignWrites: Writes[Design] = (o: Design) => JsString(o.toString)
  implicit val DisplayWrites: Writes[Display] = (o: Display) => JsString(o.toString)
  implicit val FormatDataWrites: OWrites[Format] = Json.writes[Format]
}

object Miner extends App {
  val search: SearchQuery =
    SearchQuery()
      .fromDate(Instant.parse("2022-05-09T00:00:00Z"))
      .showTags("all")
      .showFields("all")
      .showElements("all")
      .showBlocks("all")
      .pageSize(200)

  val contentApiClient: ContentApiClient = GuardianContentClient(sys.env("CONTENT_API_KEY"))

  private def extractContentFormatDataFrom(response: SearchResponse): Seq[ContentFormatData] = {
    print(".")
    for (content <- response.results.toSeq) yield ContentFormatData(formatFor(content), content.webUrl)
  }

  val allContentSearch =
    contentApiClient.paginateAccum[SearchQuery,SearchResponse,Seq[ContentFormatData]](search)(extractContentFormatDataFrom, _ ++ _)

  for {
    allContent <- allContentSearch
  } {
    val sorted = allContent.groupBy(_.format).mapV(_.size).toSeq.sortBy(_._2)
    println(sorted.mkString("\n"))
    println(allContent.size)
    println(sorted.size)
    val allContentJson = Json.toJson(allContent)
    println(Json.prettyPrint(allContentJson))
  }

  val sortedCounts = allContentSearch.map { _.groupBy(_.format).mapV(_.size).toSeq.sortBy(_._2) }

  def formatFor(content: Content): Format = {
    Format(content.theme, content.design, content.display)
  }
}
