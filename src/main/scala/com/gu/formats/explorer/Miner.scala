package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.utils.format.{Design, Display, Theme}
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}
import com.madgag.scala.collection.decorators._

import scala.concurrent.ExecutionContext.Implicits.global

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
  val search: SearchQuery = SearchQuery().showTags("all").showFields("all").showElements("all").pageSize(200)  //todo get blocks?

  val contentApiClient: ContentApiClient = GuardianContentClient(sys.env("CONTENT_API_KEY"))

  val allContentSearch = contentApiClient.getResponse(search) map { response =>
    val dataForContents = for (content <- response.results) yield ContentFormatData(formatFor(content), content.webUrl)
    println(dataForContents.groupBy(_.format).mapV(_.size).toSeq.sortBy(_._2).mkString("\n"))
  }


  def formatFor(content: Content): Format = {
    Format(content.theme, content.design, content.display)
  }
}
