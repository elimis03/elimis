export interface DailyBoxOffice {
  rnum: string;
  rank: string;
  rankInten: string;
  rankOldAndNew: 'OLD' | 'NEW';
  movieCd: string;
  movieNm: string;
  openDt: string;
  salesAmt: string;
  salesShare: string;
  salesInten: string;
  salesChange: string;
  salesAcc: string;
  audiCnt: string;
  audiInten: string;
  audiChange: string;
  audiAcc: string;
  scrnCnt: string;
  showCnt: string;
}

export interface BoxOfficeResult {
  boxofficeType: string;
  showRange: string;
  dailyBoxOfficeList: DailyBoxOffice[];
}

export interface BoxOfficeResponse {
  boxOfficeResult?: {
    boxofficeType: string;
    showRange: string;
    dailyBoxOfficeList: DailyBoxOffice[];
  };
  faultInfo?: {
    message: string;
    errorCode: string;
  };
}

export interface Genre {
  genreNm: string;
}

export interface Director {
  peopleNm: string;
  peopleNmEn: string;
}

export interface Actor {
  peopleNm: string;
  peopleNmEn: string;
  cast: string;
  castEn: string;
}

export interface Audit {
  auditNo: string;
  watchGradeNm: string;
}

export interface Company {
  companyCd: string;
  companyNm: string;
  companyNmEn: string;
  companyPartNm: string;
}

export interface MovieInfo {
  movieCd: string;
  movieNm: string;
  movieNmEn: string;
  movieNmOg: string;
  showTm: string;
  openDt: string;
  prdtYear: string;
  typeNm: string;
  prdtStatNm: string;
  nationNm: string;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
  companys: Company[];
  audits: Audit[];
}

export interface MovieInfoResult {
  movieInfo: MovieInfo;
  source: string;
}

export interface MovieDetailResponse {
  movieInfoResult?: MovieInfoResult;
  faultInfo?: {
    message: string;
    errorCode: string;
  };
}
