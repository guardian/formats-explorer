package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.{Content, SearchResponse}
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.utils.format.{Design, Display, Theme}
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}
import com.madgag.scala.collection.decorators._

import java.time.Instant
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class ContentFormatData(
  format: Format,
  webUrl: String,
)

case class Format(
  theme: Theme,
  design: Design,
  display: Display
)

object Miner extends App {
  val search: SearchQuery =
    SearchQuery()
      .fromDate(Instant.parse("2022-05-07T00:00:00Z"))
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
  }

  val sortedCounts = allContentSearch.map { _.groupBy(_.format).mapV(_.size).toSeq.sortBy(_._2) }

  def formatFor(content: Content): Format = {
    Format(content.theme, content.design, content.display)
  }
}
