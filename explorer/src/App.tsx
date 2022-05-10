import data from './data.json'
import { groupBy } from 'lodash'
import { useState } from 'react';
import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from '@guardian/libs'

type ArticleData = typeof data[number];
// type ArticleJsonFormat = ArticleData["format"];


export const App = () => {
  return <>
    <Search data={data} />
    <MostPopular data={data} />
  </>
}

// type ArticleDesign = 'Analysis' | 'Audio'

const getTheme = (theme: ArticleTheme, prefix?: boolean) => {
  if (theme.valueOf() >= 5) return prefix ? `${ArticleSpecial[theme]}Special` : ArticleSpecial[theme]
  else return prefix ? `${ArticlePillar[theme]}Pillar` : ArticlePillar[theme]
}

const getDesign = (design: ArticleDesign) => {
  const value = ArticleDesign[design]
  if (value === 'Standard') return 'Article'
  else return value
}

const Search = ({ data }: { data: ArticleData[] }) => {
  const [theme, setTheme] = useState<ArticleTheme>()
  const [design, setDesign] = useState<ArticleDesign>()
  const [display, setDisplay] = useState<ArticleDisplay>()

  const designChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDesign(parseInt(event.target.value) as ArticleDesign)
  }
  const displayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplay(parseInt(event.target.value) as ArticleDisplay)
  }
  const themeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value)
    if (value >= 4) setTheme(value as ArticleSpecial)
    else setTheme(value as ArticlePillar)
  }

  return <div>
    <label >Design ({design !== undefined ? ArticleDesign[design] : ''}): </label>
    <select id="design" name="design" onChange={designChange}>
      {
        Object.entries(ArticleDesign).slice(23).map(([name, value]) => {
          return <option value={value}>{name}</option>
        })
      }
    </select>
    <label >Theme ({theme !== undefined ? getTheme(theme) : ''}): </label>

    <select id="theme" name="theme" onChange={themeChange}>
      {
        Object.entries(ArticlePillar).slice(5).map(([name, value]) => {
          return <option value={value}>{name}</option>
        })
      }
      {
        Object.entries(ArticleSpecial).slice(2).map(([name, value]) => {
          return <option value={value}>{name}</option>
        })
      }
    </select>
    <label >Display ({display !== undefined ? ArticleDisplay[display] : ''}): </label>

    <select id="display" name="display" onChange={displayChange}>
      {
        Object.entries(ArticleDisplay).slice(4).map(([name, value]) => {
          return <option value={value}>{name}</option>
        })
      }
    </select>

    {
      (theme !== undefined && display !== undefined && design !== undefined) ? <Filtered data={data} format={{ design, display, theme }}/> : 'Result will appear here...'
    }
  </div>

}

const Filtered = ({ format, data}: { format: ArticleFormat, data: ArticleData[] }) => {
  const filtered = data.filter((article: ArticleData) => {
    return (
      article.format.design === `${getDesign(format.design)}Design` &&
      article.format.display === `${ArticleDisplay[format.display]}Display` &&
      article.format.theme === `${getTheme(format.theme, true)}`
    )
  })

  console.log(filtered)

  return <ul>
    {
      filtered.map((article: ArticleData) => <li><a href={article.webUrl}>{article.webUrl}</a></li>)
    }
 </ul>
}

const MostPopular = ({ data }: { data: ArticleData[] }) => {
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