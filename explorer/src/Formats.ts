export enum ArticlePillar {
	News = 0,
	Opinion = 1,
	Sport = 2,
	Culture = 3,
	Lifestyle = 4,
}

export enum ArticleSpecial {
	SpecialReport = 5,
	Labs = 6,
}

export enum ArticleDesign {
	Article,
	Gallery,
	Audio,
	Video,
	Review,
	Analysis,
	Comment,
	Letter,
	Feature,
	LiveBlog,
	DeadBlog,
	Recipe,
	MatchReport,
	Interview,
	Editorial,
	Quiz,
	Interactive,
	PhotoEssay,
	PrintShop,
	Obituary,
	FullPageInteractive,
	NewsletterSignup,
}

export enum ArticleDisplay {
	Standard,
	Immersive,
	Showcase,
	NumberedList,
	Column,
}

export type ArticleTheme = ArticlePillar | ArticleSpecial

export interface ArticleFormat {
	theme: ArticleTheme;
	design: ArticleDesign;
	display: ArticleDisplay;
}
