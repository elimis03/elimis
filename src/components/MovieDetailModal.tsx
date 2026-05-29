import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Clock, Film, Award, Users, Globe, Building2, User 
} from 'lucide-react';
import { MovieInfo, MovieDetailResponse } from '../types';

interface MovieDetailModalProps {
  movieCd: string;
  movieNm: string;
  isDark: boolean;
  onClose: () => void;
}

export default function MovieDetailModal({ movieCd, movieNm, isDark, onClose }: MovieDetailModalProps) {
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

  // Format opening date YYYYMMDD to YYYY.MM.DD
  const formatOpenDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}년 ${dateStr.substring(4, 6)}월 ${dateStr.substring(6, 8)}일`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
        id="modal-backdrop"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className={`relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        id="modal-content"
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${
              isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
            }`}>
              영화 상세 정보
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{movieNm}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                영화 정보를 불러오고 있습니다...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-500 mb-3">
                <X className="w-6 h-6" />
              </div>
              <p className="text-red-500 font-medium">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                닫기
              </button>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Primary Info Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4.5 rounded-xl border ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-semibold">개봉일</span>
                  </div>
                  <p className="text-sm font-semibold tracking-tight">
                    {detail.openDt ? formatOpenDate(detail.openDt) : '정보 없음'}
                  </p>
                </div>

                <div className={`p-4.5 rounded-xl border ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-2 text-amber-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold">상영시간</span>
                  </div>
                  <p className="text-sm font-semibold tracking-tight">
                    {detail.showTm ? `${detail.showTm}분` : '정보 없음'}
                  </p>
                </div>

                <div className={`p-4.5 rounded-xl border ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-semibold">관람 등급</span>
                  </div>
                  <p className="text-xs font-semibold tracking-tight truncate" title={detail.audits[0]?.watchGradeNm || '등급 정보 없음'}>
                    {detail.audits[0]?.watchGradeNm || '등급 정보 없음'}
                  </p>
                </div>

                <div className={`p-4.5 rounded-xl border ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center space-x-2 text-rose-500 mb-1">
                    <Film className="w-4 h-4" />
                    <span className="text-xs font-semibold">장르</span>
                  </div>
                  <p className="text-sm font-semibold tracking-tight truncate">
                    {detail.genres.map(g => g.genreNm).join(', ')}
                  </p>
                </div>
              </div>

              {/* Subtitles & Details */}
              <div className="space-y-4">
                {detail.movieNmEn && (
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      영어 제목 (English Title)
                    </h4>
                    <p className="text-base font-medium">{detail.movieNmEn}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      제작 국가 / 제작 연도
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{detail.nationNm || '정보 없음'} ({detail.prdtYear}년)</span>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      영화 형태 / 상태
                    </h4>
                    <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md mr-2 ${
                      isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-150 text-slate-700'
                    }`}>
                      {detail.typeNm}
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md ${
                      detail.prdtStatNm === '개봉' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-150 text-slate-700')
                    }`}>
                      {detail.prdtStatNm}
                    </span>
                  </div>
                </div>

                <hr className={isDark ? 'border-slate-800' : 'border-slate-150'} />

                {/* Director Section */}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    감독 (Directors)
                  </h4>
                  {detail.directors && detail.directors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detail.directors.map((dir, index) => (
                        <div 
                          key={index}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-sm font-semibold">{dir.peopleNm}</span>
                          {dir.peopleNmEn && (
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                              ({dir.peopleNmEn})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      감독 정보가 등록되어 있지 않습니다.
                    </p>
                  )}
                </div>

                {/* Actor Section */}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    출연 배우 (Actors)
                  </h4>
                  {detail.actors && detail.actors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detail.actors.slice(0, 10).map((actor, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-2.5 rounded-lg border ${
                            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-150'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-semibold">{actor.peopleNm}</span>
                          </div>
                          {actor.cast ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {actor.cast} 역
                            </span>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>배우</span>
                          )}
                        </div>
                      ))}
                      {detail.actors.length > 10 && (
                        <p className={`text-xs col-span-full pt-1 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          외 {detail.actors.length - 10}명의 출연 배우가 있습니다.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      출연진 정보가 등록되어 있지 않습니다.
                    </p>
                  )}
                </div>

                {/* Companies Section */}
                {detail.companys && detail.companys.length > 0 && (
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      참여 영화사 (Companies)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detail.companys.slice(0, 4).map((comp, index) => (
                        <span 
                          key={index}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-md border ${
                            isDark ? 'bg-slate-855 border-slate-800 text-slate-300' : 'bg-white border-slate-150 text-slate-600'
                          }`}
                        >
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{comp.companyNm}</span>
                          <span className={`text-[10px] uppercase font-bold px-1 rounded ${
                            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-550'
                          }`}>
                            {comp.companyPartNm}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4.5 py-2 text-sm font-semibold rounded-xl transition-all ${
              isDark 
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            id="modal-close-footer-btn"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
