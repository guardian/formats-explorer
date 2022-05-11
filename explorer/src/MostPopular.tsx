import { groupBy } from 'lodash'
import { useState } from 'react'
import { ArticleData } from './App'
import { ThumbnailCard } from './ThumbnailCard'

export const MostPopular = ({ data }: { data: ArticleData[] }) => {
    const [visible, setVisible] = useState<string[]>([])

    const onVisibleClick = (name: string) => () => {
      const index = visible.indexOf(name)
      if (index !== -1 ) {
        setVisible(visible.splice(index + 1, 1))
      } else {
        setVisible([name, ...visible])
      }
    }

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
                <div className="row mt-3 mb-3">
                  {
                    list.map((article: ArticleData) => <div className='col-3'><ThumbnailCard article={article}></ThumbnailCard></div>)
                  }
                </div>
                {
                  visible.includes(name) ? 
                    <div className='row mb-3'>
                      {data.map(a => <div className='col-6'><li><a href={a.webUrl}>{a.webUrl}</a></li></div>)}
                    </div>
                  : ''
                }
                <button onClick={onVisibleClick(name)} className='btn btn-outline-dark mb-3'>{visible.includes(name) ? 'Hide' : 'Show'} all articles</button>
              </div>
              
            )
          })}
        </div>
      </div>
    </div>
  }