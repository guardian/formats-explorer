import data from './format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json'
import { Search } from './Search';
import { MostPopular } from './MostPopular';
import { NotUsed } from './NotUsed'

export type ArticleData = typeof data[number];

export const App = () => {
  return <>
    <Search data={data} />
    <NotUsed data={data} />
    <MostPopular data={data} />
  </>
}
