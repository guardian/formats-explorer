import { ArticleData } from './App'

export const ThumbnailCard = ({ article }: { article: ArticleData }) => {
    const getImageUrl = (webUrl: string): string => {
        const urlObj = new URL(webUrl);
        const pathname = urlObj.pathname;
        const id = pathname.length > 200 ? pathname.slice(pathname.length - 100) : pathname
        const filename = `${id.replaceAll("/", "-")}.webp`;
        // https://playground-dist.s3.eu-west-1.amazonaws.com/formats-explorer/400/https%253A%252F%252Fwww.theguardian.com%252Fadvertiser-content%252Fmccormick-2022%252Fhow-a-130-year-old-flavor-company-leads-with-sustainability-and-social-good.webp
        return `https://playground-dist.s3.eu-west-1.amazonaws.com/formats-explorer/400/${filename}`
      }

    return <div className='thumbnail-card'><a href={article.webUrl}><img src={getImageUrl(article.webUrl)} alt="xxx"/></a></div>
  }