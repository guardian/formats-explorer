import { groupBy } from 'lodash'
import { ArticleData } from './App'
import { ThumbnailCard } from './ThumbnailCard'

export const MostPopular = ({ data }: { data: ArticleData[] }) => {
    const grouped = groupBy(data, (a: ArticleData) => `${a.format.design} - ${a.format.display} - ${a.format.theme}`)
  
    return <div className='container mt-5'>
      <div className='row'>
        <div className='col-12'>
      <h2>Most Popular</h2>
          { Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map((test) => {
            const [name, data] = test;

            const list = [...data]
              .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
              .slice(0, 8)
      
            return (
              <div>
                <h4 id={name.replaceAll(' - ', '')}>{name} <span className="badge bg-secondary">{data.length}</span></h4>
                <div className="row mt-3 mb-5">
                  {
                    list.map((article: ArticleData) => <div className='col-3'><ThumbnailCard article={article}></ThumbnailCard></div>)
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  }