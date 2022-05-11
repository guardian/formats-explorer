import { useState } from 'react'
import { ArticleData } from './App'
import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from './Formats'

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


    return <div className='container mt-5'>
        <div className='row'>
        <h2>What's used?!</h2>
        <div className='col-3'>
            <label className='form-label'>Select Display: </label>
            <select className='form-control' id="display" name="display" onChange={displayChange}>
            <option value="unset">Select display ...</option>
                {
                Object.entries(ArticleDisplay).slice(5).map(([name, value]) => {
                    return <option value={value}>{name}</option>
                })
                }
            </select>
        </div>
        { display !== undefined ? <div>
            <table className='table'>
                    <thead>
                    <tr>
                        <th scope="col"></th>
                        {specials.map(special => <th scope="col">{typeof special !== 'string'? ArticleSpecial[special]: ''}</th>)}
                        {pillars.map(pillar => <th scope="col">{typeof pillar !== 'string'? ArticlePillar[pillar]: ''}</th>)}
                    </tr>
                    </thead>
                    <tbody>
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
                        return <tr><th scope="row">{ArticleDesign[design]}</th>{rows}</tr> 
                    })
                }
                </tbody>
            </table>
        </div> : ''}
        </div>
    </div>
  }