import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Globe, Calendar, Clock, Tv, Eye, Sparkles, User, Award, Film, CircleDot
} from 'lucide-react';
import { MovieInfo, MovieDetailResponse } from '../types';

interface MovieBentoDetailProps {
  key?: string;
  movieCd: string;
  movieNm: string;
  salesShare: string;
  audiCnt: string;
  audiAcc: string;
  isDark: boolean;
  openDt: string;
}

export default function MovieBentoDetail({ 
  movieCd, 
  movieNm, 
  salesShare, 
  audiCnt, 
  audiAcc, 
  isDark,
  openDt
}: MovieBentoDetailProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MovieInfo | null>(null);

  useEffect(() => {
    let active = true;
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/movie-detail?movieCd=${movieCd}`);
        if (!res.ok) {
          throw new Error('영화 상세 정보를 불러오는데 실패했습니다.');
        }
        const data: MovieDetailResponse = await res.json();
        if (data.faultInfo) {
          throw new Error(data.faultInfo.message);
        }
        if (data.movieInfoResult?.movieInfo) {
          if (active) {
            setDetail(data.movieInfoResult.movieInfo);
          }
        } else {
          throw new Error('상세 정보 결과가 존재하지 않습니다.');
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || '상세 정보를 불러올 수 없습니다.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMovieDetail();
    return () => {
      active = false;
    };
  }, [movieCd]);

  const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return numStr;
    return num.toLocaleString('ko-KR');
  };

  const formatAudience = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return numStr;
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만 명`;
    }
    return `${num.toLocaleString('ko-KR')}명`;
  };

  const formatOpenDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
  };

  // Pre-determined movie backdrops based on title hash or general beautiful layouts
  const getBannerBgGrad = () => {
    if (isDark) {
      return 'from-amber-600 via-indigo-950 to-slate-950';
    }
    return 'from-amber-100 via-indigo-50 to-slate-100';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="bento-detail-grid">
      {/* 1. Main Banner Card (spanning 4 columns on medium/large screens, 2 rows equivalent) */}
      <motion.div 
        key={`banner-${movieCd}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`col-span-1 sm:col-span-4 p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-lg border h-64 md:h-72 transition-all group ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 text-white' 
            : 'bg-gradient-to-br from-indigo-50 to-white border-slate-200 text-slate-900 shadow-slate-100'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-tr ${getBannerBgGrad()} opacity-15 mix-blend-overlay`} />
        
        {/* Absolute top-right corner icons/decorations */}
        <div className="absolute top-5 right-5 flex gap-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-amber-500 text-black`}>
            KOBIS SELECTION
          </span>
          {detail?.typeNm && (
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded ${
              isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {detail.typeNm}
            </span>
          )}
        </div>

        {/* Top items */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>박스오피스 주요 영화</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-none truncate max-w-[80%]">
            {movieNm}
          </h3>
          {detail?.movieNmEn && (
            <p className={`text-xs md:text-sm font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {detail.movieNmEn}
            </p>
          )}
        </div>

        {/* Bottom tags & metadata */}
        <div className="relative mt-auto pt-6 border-t border-dashed border-white/10">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>개봉일: {openDt}</span>
            </div>
            {detail?.genres && detail.genres.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Film className="w-4 h-4 text-rose-500" />
                <span>장르: {detail.genres.map(g => g.genreNm).join(', ')}</span>
              </div>
            )}
            {detail?.audits?.[0]?.watchGradeNm && (
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>{detail.audits[0].watchGradeNm}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Card 1 (Daily Audience) */}
      <div className={`col-span-1 sm:col-span-2 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Daily Audience
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {formatNumber(audiCnt)}
          </span>
          <span className="text-xs font-medium text-indigo-500">명</span>
        </div>
        <p className={`text-[10px] mt-1.5 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          당일 기준 전산망 집계 관람객 수입니다.
        </p>
      </div>

      {/* 3. Stats Card 2 (Total Audience) */}
      <div className={`col-span-1 sm:col-span-2 p-5 rounded-2xl border flex flex-col justify-between transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-805'
      }`}>
        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Total Audience
        </div>
        <div className="mt-4">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-amber-500">
            {formatAudience(audiAcc)}
          </span>
        </div>
        <p className={`text-[10px] mt-1.5 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          개봉 이후 누적 집계된 전체 관객수입니다.
        </p>
      </div>

      {/* 4. Detailed Production Info Card */}
      <div className={`col-span-1 sm:col-span-2 md:row-span-2 p-6 rounded-2xl border flex flex-col justify-between transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Production Details
        </h4>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-slate-500">정보 불러오는 중</p>
          </div>
        ) : error ? (
          <p className="text-xs text-red-500 my-4">{error}</p>
        ) : detail ? (
          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Director</div>
              <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>{detail.directors?.[0]?.peopleNm || '정보 없음'}</span>
                {detail.directors?.[0]?.peopleNmEn && (
                  <span className="text-xs text-slate-500 font-mono">({detail.directors[0].peopleNmEn})</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nation & Year</div>
              <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{detail.nationNm || '한국'} · {detail.prdtYear}년</span>
              </div>
            </div>

            {detail.audits?.[0]?.watchGradeNm && (
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Watch Grade</div>
                <div className="text-xs font-bold mt-1 text-emerald-500">
                  {detail.audits[0].watchGradeNm}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 my-4">정보 없음</p>
        )}

        <div className={`text-[10px] mt-auto font-medium py-1.5 border-t border-white/5 ${isDark ? 'text-slate-550' : 'text-slate-400'}`}>
          KOBIS OPEN API 정보 기준
        </div>
      </div>

      {/* 5. Actors Badge Cloud Card */}
      <div className={`col-span-1 sm:col-span-2 p-6 rounded-2xl border flex flex-col justify-between transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
          Cast & Crew (배우진)
        </h4>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-4 h-4 border-2 border-slate-450 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        ) : detail?.actors && detail.actors.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 my-2.5 max-h-24 overflow-y-auto custom-scrollbar">
            {detail.actors.slice(0, 8).map((actor, idx) => (
              <span 
                key={idx}
                className={`px-2 py-1 text-xs rounded-lg font-medium border ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-slate-200' 
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {actor.peopleNm}
                {actor.cast && (
                  <span className="text-[9px] opacity-60 ml-1">({actor.cast})</span>
                )}
              </span>
            ))}
            {detail.actors.length > 8 && (
              <span className={`px-2 py-1 text-xs rounded-lg border italic font-bold select-none ${
                isDark ? 'bg-indigo-950/40 border-indigo-900/30 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-550'
              }`}>
                외 {detail.actors.length - 8}명
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic my-4">출연 배우 정보 없음</p>
        )}

        <div className={`text-[10px] mt-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          대표 주연/조연 목록
        </div>
      </div>

      {/* 6. Market Share / Box Office Sales Share */}
      <div className={`col-span-1 sm:col-span-2 p-5 rounded-2xl border flex items-center justify-between transition-all ${
        isDark 
          ? 'bg-white/5 border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="space-y-1">
          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Market Share (매출점유율)
          </div>
          <div className="text-2xl font-black">{salesShare}%</div>
        </div>

        <div className="w-24 md:w-32 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="bg-amber-500 h-full rounded-full transition-all duration-550" 
            style={{ width: `${salesShare}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
