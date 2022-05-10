package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}

import scala.concurrent.ExecutionContext.Implicits.global

case class Format(
  theme: String,
  design: String,
  display: String
)

object Miner extends App {
  val search: SearchQuery = SearchQuery().showTags("all").showFields("all").showElements("all")

  val contentApiClient: ContentApiClient = GuardianContentClient(sys.env("CONTENT_API_KEY"))

  val format: Format = Format("foo", "bar", "baz")

  val allContentSearch = contentApiClient.getResponse(search) map { response =>
    val content = response.results.head
    println(s"${content.webUrl} : ${content.design}")
  }

  def formatFor(content: Content): Format = {

  }
}
