import { ArticleFormat, ArticleDesign, ArticleDisplay, ArticleTheme, ArticlePillar, ArticleSpecial } from './Formats'
import { ArticleData } from './App'
import { useState } from 'react';
import { ThumbnailCard } from './ThumbnailCard';


const getTheme = (theme: ArticleTheme, prefix?: boolean) => {
  if (theme.valueOf() === 5) return prefix ? `${ArticleSpecial[theme]}Theme` : ArticleSpecial[theme]
  if (theme.valueOf() === 6) return ArticleSpecial[theme]
  else return prefix ? `${ArticlePillar[theme]}Pillar` : ArticlePillar[theme]
}
  
const getDesign = (design: ArticleDesign) => {
const value = ArticleDesign[design]
if (value === 'Standard') return 'Article'
else return value
}
