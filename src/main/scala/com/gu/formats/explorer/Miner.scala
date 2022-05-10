package com.gu.formats.explorer

import com.gu.contentapi.client.model.SearchQuery
import com.gu.contentapi.client.utils.CapiModelEnrichment._
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}

import scala.concurrent.ExecutionContext.Implicits.global

object Miner extends App {
  val search: SearchQuery = SearchQuery().showTags("all").showFields("all").showElements("all")

  val contentApiClient: ContentApiClient = GuardianContentClient(sys.env("CONTENT_API_KEY"))

  val allContentSearch = contentApiClient.getResponse(search) map { response =>
    val content = response.results.head
    println(s"${content.webUrl} : ${content.design}")
  }
}
