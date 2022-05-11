import { groupBy } from 'lodash'
import { ArticleData } from './App'

export const MostPopular = ({ data }: { data: ArticleData[] }) => {
    const grouped = groupBy(data, (a: ArticleData) => `${a.format.design}${a.format.display}${a.format.theme}`)
  
    return <div>
      { Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map((test) => {
        const [name, data] = test;
  
        return (
          <div>
            <h2>{name} - {data.length}</h2>
            <ul>
              {
                data.map((article: ArticleData) => <li><a href={article.webUrl}>{article.webUrl}</a></li>)
              }
             </ul>
          </div>
        )
      })}
    </div>
  }