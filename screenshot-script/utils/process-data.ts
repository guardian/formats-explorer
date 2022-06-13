import { groupBy } from "lodash";

import rawData from "../../explorer/src/format-data.2022-04-27T00:00:00Z_2022-05-11T09:12:00Z.json";

export type ArticleData = typeof rawData[number];

export type GroupedArticleData = {
  [key: string]: ArticleData[];
};

const groupedExamples: GroupedArticleData = groupBy(
  rawData,
  (a: ArticleData) => `${a.format.design}${a.format.display}${a.format.theme}`
);

export const firstTenExamplesPerFormat = Object.values(groupedExamples)
  .map((examples: ArticleData[]) =>
    [...examples]
      .sort((a, b) => (a.webUrl > b.webUrl ? 1 : -1))
      .slice(0, 10)
      .map((article) => article.webUrl)
  )
  .flat();