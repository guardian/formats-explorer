import { groupBy } from 'lodash'
import { ArticleData } from './App'

export const MostPopular = ({ data }: { data: ArticleData[] }) => {
    const grouped = groupBy(data, (a: ArticleData) => `${a.format.design} - ${a.format.display} - ${a.format.theme}`)
  
    return <div className='container mt-5'>
      <div className='row'>
        <div className='col-12'>
      <h2>Most Popular</h2>
          { Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map((test) => {
            const [name, data] = test;
      
            return (
              <div>
                <h4>{name} <span className="badge bg-secondary">{data.length}</span></h4>
                <ul>
                  {
                    data.slice(0, 10).map((article: ArticleData) => <li><a href={article.webUrl}>{article.webUrl}</a></li>)
                  }
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  }