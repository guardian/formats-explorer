package com.gu.formats.explorer

import com.google.common.util.concurrent.RateLimiter
import com.gu.contentapi.client.{ContentApiClient, GuardianContentClient}
import okhttp3._

import scala.util.Try

object ContentApi {
  val client: ContentApiClient = new GuardianContentClient(sys.env("CONTENT_API_KEY")) {
    override protected def httpClientBuilder: OkHttpClient.Builder =
      super.httpClientBuilder.addInterceptor(ApiRateLogger)
  }

  object ApiRateLogger extends Interceptor  {
    val rateLimiter: RateLimiter = RateLimiter.create(1.0/60)

    val windowSizes: Seq[String] = Seq("day", "minute")

    def headerAsNumber(response: Response, headerName: String): Option[Int] =
      Option(response.header(headerName)).flatMap(str => Try(Integer.parseInt(str)).toOption)

    def intercept(chain: Interceptor.Chain) = {
      val response = chain.proceed(chain.request())
      val timeToLog = rateLimiter.tryAcquire()
      for {
        windowSize <- windowSizes
        limit <- headerAsNumber(response, s"X-RateLimit-Limit-$windowSize")
        remaining <- headerAsNumber(response, s"X-RateLimit-Remaining-$windowSize")
      } {
        val bulkOfQuotaConsumed = remaining < limit / 4
        if (timeToLog || bulkOfQuotaConsumed) {
          println(s"Content API rate limit remaining: $remaining of $limit (window size: 1 $windowSize)")
        }
      }
      response
    }
  }
}