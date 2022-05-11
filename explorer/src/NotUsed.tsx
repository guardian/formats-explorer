import { groupBy } from 'lodash'
import { useState } from 'react'
import { ArticleData } from './App'
import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from './Formats'

interface Array<T> {
    concat<U>(...items: (U | ConcatArray<U>)[]): (T | U)[]
}

const getTheme = (theme: ArticleTheme, prefix?: boolean) => {
    if (theme.valueOf() === 5) return prefix ? `${ArticleSpecial[theme]}Theme` : ArticleSpecial[theme]
    if (theme.valueOf() === 6) return ArticleSpecial[theme]
    else return prefix ? `${ArticlePillar[theme]}Pillar` : ArticlePillar[theme]
  }

export const NotUsed = ({ data }: { data: ArticleData[] }) => {
    const designs = Object.values(ArticleDesign).filter((d) => typeof d !== "string")
    const displays = Object.values(ArticleDisplay).filter((d) => typeof d !== "string")
    const specials = Object.values(ArticleSpecial).filter((d) => typeof d !== "string")
    const pillars = Object.values(ArticlePillar).filter((d) => typeof d !== "string")

    console.log(designs.length, displays.length, specials.length + pillars.length)

    const options: ArticleFormat[] = []
    for (const design of designs) {
        if (typeof design === 'string') continue
        for (const display of displays) {
            if (typeof display === 'string') continue
            for (const special of specials) {
                if (typeof special === 'string') continue
                options.push({
                    design,
                    display,
                    theme: special,
                })
            } 
            for (const pillar of pillars){
                if (typeof pillar === 'string') continue
                options.push({
                    design,
                    display,
                    theme: pillar,
                })
            }
        }
    }

    const [display, setDisplay] = useState<ArticleDisplay>()

    const displayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'unset') setDisplay(undefined)
        else setDisplay(parseInt(event.target.value) as ArticleDisplay)
      }

    const articleFormatCompare = (article: ArticleData, format: ArticleFormat):boolean => {
        return (
          article.format.design === `${ArticleDesign[format.design]}Design` &&
          article.format.display === `${ArticleDisplay[format.display]}Display` &&
          article.format.theme === `${getTheme(format.theme, true)}`
        ) 
    }


    return <div>
        <select id="display" name="display" onChange={displayChange}>
        <option value="unset">Select</option>
            {
            Object.entries(ArticleDisplay).slice(5).map(([name, value]) => {
                return <option value={value}>{name}</option>
            })
            }
        </select>
        { display !== undefined ? <div>
            <table>
                
                    <tr>
                        <td></td>
                        {specials.map(special => <td>{typeof special !== 'string'? ArticleSpecial[special]: ''}</td>)}
                        {pillars.map(pillar => <td>{typeof pillar !== 'string'? ArticlePillar[pillar]: ''}</td>)}
                    </tr>
                    {designs.map((design) => {
                        if (typeof design === 'string') return ''
                        const rows = []
                        rows.push(specials.map((special) => {
                            if (typeof special === 'string') return ''
                            return <><td>{ data.find((a) => articleFormatCompare(a, {
                                design,
                                display,
                                theme: special
                            })) ? '✅' : ' ' }</td></>
                        })) 
                        rows.push(pillars.map((pillar) => {
                            if (typeof pillar === 'string') return ''
                            return <><td>{ data.find((a) => articleFormatCompare(a, {
                                design,
                                display,
                                theme: pillar
                            })) ? '✅' : ' ' }</td></>
                        }))
                        return <tr><td>{ArticleDesign[design]}</td>{rows}</tr> 
                    })
                }
            </table>
        </div> : ''}
    </div>


    // const grouped = groupBy(data, (a: ArticleData) => `${a.format.design}${a.format.display}${a.format.theme}`)
  
    // return <div>
    //   { Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map((test) => {
    //     const [name, data] = test;
  
    //     return (
    //       <div>
    //         <h2>{name} - {data.length}</h2>
    //         <ul>
    //           {
    //             data.map((article: ArticleData) => <li><a href={article.webUrl}>{article.webUrl}</a></li>)
    //           }
    //          </ul>
    //       </div>
    //     )
    //   })}
    // </div>
  }