import { useState } from 'react'
import { ArticleData } from './App'
import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from './Formats'
import {ThumbnailCard} from "./ThumbnailCard";

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
    const [theme, setTheme] = useState<ArticleTheme>()
    const [design, setDesign] = useState<ArticleDesign>()

    const displayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'unset') setDisplay(undefined)
        else setDisplay(parseInt(event.target.value) as ArticleDisplay)
      }

    const designAndThemeChange = (newDesign: ArticleDesign, newTheme: ArticleTheme) => () => {
        setDesign(newDesign)
        setTheme(newTheme)
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



        { display !== undefined ? <div className='col-5'>
            <table className='table table-striped'>
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
                            const articles = data.filter(a => articleFormatCompare(a, {
                                design,
                                display,
                                theme: special
                            }))

                            let sampleArticle = articles[0];
                            if (sampleArticle) {
                                let newDesign = sampleArticle.format.design;
                                let newTheme = sampleArticle.format.theme;
                                return <td><a onClick={designAndThemeChange(design, special)}
                                ><span className="badge rounded-pill bg-success">{articles.length}</span></a></td>
                            }

                            else return <td><span className='badge rounded-pill text-dark'>0</span></td>
                        })) 
                        rows.push(pillars.map((pillar) => {
                            if (typeof pillar === 'string') return ''
                            const articles = data.filter(a => articleFormatCompare(a, {
                                design,
                                display,
                                theme: pillar
                            }))

                            if (articles[0]) {
                                return <td><a onClick={designAndThemeChange(design, pillar)}
                                ><span className="badge rounded-pill bg-success">{articles.length}</span></a></td>
                            }

                            else return <td><span className='badge rounded-pill text-dark'>0</span></td>
                        }))
                        return <tr><th scope="row">{ArticleDesign[design]}</th>{rows}</tr> 
                    })
                }
                </tbody>
            </table>
        </div> : ''}

            <div className='col-4'>
            {(display !== undefined && design !== undefined && theme !== undefined) ?
                <Filtered data={data} format={{design, display, theme}}/> : ''
            }
            </div>
        </div>
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

    const list = [...filtered]
        .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
        .slice(0, 8)

    if (!list.length) {
        return <div>No results found {':('}</div>
    }

    return <div className='row'>
        {
            list.map((article: ArticleData) => <div className='col-3'><ThumbnailCard article={article} /></div>)
        }
    </div>
}

const getDesign = (design: ArticleDesign) => {
    const value = ArticleDesign[design]
    if (value === 'Standard') return 'Article'
    else return value
}