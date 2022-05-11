import data from './format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json'

import { MostPopular } from './MostPopular';
import { NotUsed } from './NotUsed'

import './main.css'

export type ArticleData = typeof data[number];

export const App = () => {
  return <>
    <NotUsed data={data} />
  </>
}
