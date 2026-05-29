import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Globe, Calendar, Clock, Tv, Eye, Sparkles, User, Award, Film, CircleDot,
  Copy, Check
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

  // States for AI Review Generator
  const [keywords, setKeywords] = useState<string[]>(['', '', '']);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const PRESET_KEYWORDS = ['스릴만점', '눈물펑펑', '반전영화', '연기천재', '영상미대박', '여운이남는', '가족영화', '꿀잼보장', '인생명작'];

  const handlePresetClick = (preset: string) => {
    const emptyIdx = keywords.findIndex(k => k.trim() === '');
    if (emptyIdx !== -1) {
      const next = [...keywords];
      next[emptyIdx] = preset;
      setKeywords(next);
    } else {
      const next = [...keywords];
      next[2] = preset;
      setKeywords(next);
    }
  };

  const handleGenerate = async () => {
    if (keywords.some(k => k.trim() === '')) {
      setAiError('3개의 키워드를 모두 채우거나 선택해 주세요.');
      return;
    }
    try {
      setAiLoading(true);
      setAiError(null);
      setGeneratedReview(null);

      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieNm,
          keywords: keywords.map(k => k.trim())
        })
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Fallback if not JSON
      }

      if (!response.ok) {
        const errMsg = responseData?.error || '감상평 생성에 실패했습니다.';
        throw new Error(errMsg);
      }

      if (responseData?.error) {
        throw new Error(responseData.error);
      }
      setGeneratedReview(responseData?.comment || '');
    } catch (err: any) {
      setAiError(err.message || '오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2005);
  };

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

      {/* 7. AI Keyword Review Generator Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className={`col-span-1 sm:col-span-4 p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-[#12121D]/90 to-slate-950/90 border-[#1F1F35] text-white' 
            : 'bg-gradient-to-br from-indigo-50/50 via-white to-white border-slate-200 text-slate-900 shadow-sm'
        }`}
        id="bento-ai-review"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dashed border-indigo-500/10 dark:border-white/10 border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/15">
              <Sparkles className="w-5 h-5 text-amber-100 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>AI 감상평 메이커</span>
                <span className="text-[10px] uppercase font-mono font-black border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                  GEMINI 3.5 FLASH
                </span>
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                원하는 평론 키워드 3개를 입력하면, AI가 맞춤형 웰메이드 감상평을 한글로 작성합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left panel: Input and Preset tags */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#888899] dark:text-[#888899] text-slate-550 block">
                감상 키워드 3가지
              </label>
              
              <div className="flex flex-col gap-2.5">
                {keywords.map((kw, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-amber-500">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={kw}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = [...keywords];
                        next[idx] = val;
                        setKeywords(next);
                      }}
                      placeholder={`예: ${['긴장감넘치는', '배우들인생작', '반전대박'][idx]}`}
                      className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border font-bold focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-black/40 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20' 
                          : 'bg-white border-slate-205 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                      }`}
                    />
                    {kw && (
                      <button 
                        onClick={() => {
                          const next = [...keywords];
                          next[idx] = '';
                          setKeywords(next);
                        }}
                        className="absolute right-3 text-slate-400 hover:text-rose-500 transition-colors w-5 h-5 flex items-center justify-center font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Presets suggestions */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-[#888899] dark:text-[#888899] uppercase tracking-widest">추천 시네키워드</span>
                <button 
                  onClick={() => setKeywords(['', '', ''])}
                  className="text-[9px] font-bold text-rose-500 hover:underline flex items-center gap-0.5"
                >
                  초기화
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_KEYWORDS.map((preset) => {
                  const isAlreadySelected = keywords.includes(preset);
                  return (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      disabled={isAlreadySelected}
                      className={`px-2 py-1 text-[11px] rounded-lg border font-semibold transition-all ${
                        isAlreadySelected
                          ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-white/5 text-slate-400 border-transparent'
                          : isDark
                            ? 'bg-white/5 border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-white hover:bg-white/10'
                            : 'bg-slate-100 border-slate-200 hover:border-indigo-300 text-slate-650 hover:text-indigo-600'
                      }`}
                    >
                      +{preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit generate button */}
            <button
              onClick={handleGenerate}
              disabled={aiLoading}
              className={`w-full py-2.5 rounded-xl font-black text-xs transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                aiLoading
                  ? 'bg-slate-300 dark:bg-indigo-950/40 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 text-black shadow-md shadow-amber-500/10 hover:bg-amber-400'
              }`}
            >
              {aiLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>감상평 작문 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>스마트 감상평 생성하기</span>
                </>
              )}
            </button>
          </div>

          {/* Right panel: Output preview screen */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-center min-h-[160px] relative transition-all ${
              isDark 
                ? 'bg-black/30 border-white/5' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <AnimatePresence mode="wait">
                {aiLoading ? (
                  <motion.div 
                    key="ai-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center space-y-3 py-6"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-200 dark:text-slate-100">
                        "{movieNm}"의 평론 시퀀스를 조합하는 중...
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Gemini AI 모델이 추천 감상평 문장을 빚어내고 있습니다.
                      </p>
                    </div>
                  </motion.div>
                ) : aiError ? (
                  <motion.div 
                    key="ai-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <CircleDot className="w-6 h-6 text-rose-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-semibold text-rose-500">{aiError}</p>
                  </motion.div>
                ) : generatedReview ? (
                  <motion.div 
                    key="ai-success"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Copy Success indicator */}
                    <div className="flex items-center justify-between border-b border-white/5 dark:border-white/5 border-slate-200 pb-2.5">
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> GENIALLY CRAFTED REVIEW
                      </span>
                      <button
                        onClick={handleCopy}
                        className={`px-2.5 py-1 text-[11px] rounded-lg flex items-center gap-1.5 font-bold border transition-all ${
                          copied 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : isDark
                              ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>클립보드 복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-indigo-500" />
                            <span>감상평 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className={`text-xs leading-relaxed font-semibold font-sans whitespace-pre-wrap select-text italic ${
                      isDark ? 'text-slate-100' : 'text-slate-800'
                    }`}>
                      {"“ " + generatedReview.trim().replace(/^"|"$/g, '') + " ”"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="ai-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 text-slate-500"
                  >
                    <CircleDot className="w-5 h-5 text-amber-500 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-xs font-semibold leading-relaxed">
                      왼쪽에서 3개의 키워드를 작성하거나<br />
                      추천 태그를 조합하여 <span className="text-amber-500 font-bold">감상평을 빌드</span>해 보세요!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-2 font-mono text-right">
              *작성 버튼을 누르면 Gemini 3.5 Flash 모델의 실시간 평리가 기고됩니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
