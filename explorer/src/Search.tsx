import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from '@guardian/libs'
import { ArticleData } from './App'
import { useState } from 'react';


const getTheme = (theme: ArticleTheme, prefix?: boolean) => {
    if (theme.valueOf() >= 5) return prefix ? `${ArticleSpecial[theme]}Special` : ArticleSpecial[theme]
    else return prefix ? `${ArticlePillar[theme]}Pillar` : ArticlePillar[theme]
  }
  
const getDesign = (design: ArticleDesign) => {
const value = ArticleDesign[design]
if (value === 'Standard') return 'Article'
else return value
}
  
export const Search = ({ data }: { data: ArticleData[] }) => {
    const [theme, setTheme] = useState<ArticleTheme>()
    const [design, setDesign] = useState<ArticleDesign>()
    const [display, setDisplay] = useState<ArticleDisplay>()
  
    const designChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value === 'unset') setDesign(undefined)
      else setDesign(parseInt(event.target.value) as ArticleDesign)
    }
    const displayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value === 'unset') setDisplay(undefined)
      else setDisplay(parseInt(event.target.value) as ArticleDisplay)
    }
    const themeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value === 'unset') setDesign(undefined)
      else {
        const value = parseInt(event.target.value)
        if (value >= 4) setTheme(value as ArticleSpecial)
        else setTheme(value as ArticlePillar)
      }
    }
  
    return <div>
      <label >Design ({design !== undefined ? ArticleDesign[design] : ''}): </label>
      <select id="design" name="design" onChange={designChange}>
        <option value="unset">Select</option>
        {
          Object.entries(ArticleDesign).slice(23).map(([name, value]) => {
            return <option value={value}>{name}</option>
          })
        }
      </select>
      <label >Theme ({theme !== undefined ? getTheme(theme) : ''}): </label>
  
      <select id="theme" name="theme" onChange={themeChange}>
      <option value="unset">Select</option>
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
      <option value="unset">Select</option>
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
  
    return <ul>
      {
        filtered.map((article: ArticleData) => <li><a href={article.webUrl}>{article.webUrl}</a></li>)
      }
   </ul>
  }