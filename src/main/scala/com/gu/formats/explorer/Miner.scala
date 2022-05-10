package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.utils.format.{Design, Display, Theme}
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}
import com.madgag.scala.collection.decorators._

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
  val search: SearchQuery = SearchQuery().showTags("all").showFields("all").showElements("all").showBlocks("all").pageSize(200) //todo get blocks?

  val contentApiClient: ContentApiClient = GuardianContentClient(sys.env("CONTENT_API_KEY"))


  def contentSearch(pageNumber: Int): Future[collection.Seq[ContentFormatData]] = {
    println(s"searching: ${pageNumber}")
    contentApiClient.getResponse(search.page(pageNumber)) map { response =>
      println(s"got response: ${pageNumber}")
      for (content <- response.results) yield ContentFormatData(formatFor(content), content.webUrl)
    }
  }

  val allContentSearch = Future.traverse((1 to 10).toList)(contentSearch).map(_.flatten)

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
