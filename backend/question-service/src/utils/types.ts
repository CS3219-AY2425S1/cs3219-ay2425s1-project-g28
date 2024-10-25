export type QnListSearchFilterParams = {
  page: string;
  qnLimit: string;
  title?: string;
  complexities?: string | string[];
  categories?: string | string[];
};

export type RandomQnCriteria = {
  category: string;
  complexity: string;
};
