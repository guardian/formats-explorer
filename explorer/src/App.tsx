import data from './data.json'
import { Search } from './Search';
import { MostPopular } from './MostPopular';

export type ArticleData = typeof data[number];

export const App = () => {
  return <>
    <Search data={data} />
    <MostPopular data={data} />
  </>
}
