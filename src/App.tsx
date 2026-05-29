import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Film, ChevronRight, TrendingUp, TrendingDown, Minus, 
  RotateCcw, AlertTriangle, Sparkles, TrendingUp as LiveTrend, Info
} from 'lucide-react';
import { DailyBoxOffice, BoxOfficeResponse } from './types';
import MovieDetailModal from './components/MovieDetailModal';
import MovieBentoDetail from './components/MovieBentoDetail';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Calculate Yesterday's date (max selectable date)
  const getYesterdayDateString = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDateString());
  const [boxOfficeList, setBoxOfficeList] = useState<DailyBoxOffice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Movie State (for the Bento Grid representation)
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [selectedMovieNm, setSelectedMovieNm] = useState<string | null>(null);

  // Sync isDark state to document root body/html tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = "bg-[#0A0A0A] text-slate-100 transition-colors duration-300";
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = "bg-[#F9F9FB] text-slate-900 transition-colors duration-300";
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Fetch Daily Box Office
  const fetchBoxOffice = async (dateStr: string) => {
    try {
      setLoading(true);
      setError(null);
      const apiDate = dateStr.replace(/-/g, '');
      const response = await fetch(`/api/boxoffice?date=${apiDate}`);
      if (!response.ok) {
        throw new Error('박스오피스 정보를 가져오는데 실패했습니다.');
      }
      const data: BoxOfficeResponse = await response.json();
      
      if (data.faultInfo) {
        throw new Error(data.faultInfo.message);
      }

      if (data.boxOfficeResult?.dailyBoxOfficeList) {
        const list = data.boxOfficeResult.dailyBoxOfficeList;
        setBoxOfficeList(list);
        
        // Auto-select the first movie in the list on day change
        if (list.length > 0) {
          setSelectedMovieCd(list[0].movieCd);
          setSelectedMovieNm(list[0].movieNm);
        } else {
          setSelectedMovieCd(null);
          setSelectedMovieNm(null);
        }
      } else {
        setBoxOfficeList([]);
        setSelectedMovieCd(null);
        setSelectedMovieNm(null);
        throw new Error('해당 날짜의 데이터 결과가 존재하지 않습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '데이터를 불러올 수 없습니다. 인터넷 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  // Convert Date (2026-05-28) to Korean styled string (2026년 05월 28일)
  const formatKoreanDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  };

  // Find currently active movie details from active selection
  const activeMovieObj = boxOfficeList.find(m => m.movieCd === selectedMovieCd);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F9F9FB] text-slate-900'
    }`}>
      {/* Header Navigation */}
      <header className={`flex items-center justify-between px-6 py-4 border-b transition-colors duration-300 ${
        isDark ? 'border-white/10 bg-[#0F0F0F]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Film className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
              CINE<span className="text-amber-500 font-black">STATS</span>
            </h1>
            <p className={`text-[10px] uppercase font-mono tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              KOBIS BOX OFFICE PORTAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Custom Styled Date Picker Wrapper */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all shadow-sm ${
            isDark 
              ? 'bg-white/5 border-white/10 text-slate-350 hover:bg-white/10' 
              : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
          }`}>
            <Calendar className="w-4 h-4 text-indigo-505" />
            <span className="max-w-[125px] font-mono">{selectedDate}</span>
            <input
              type="date"
              id="boxoffice-date-control"
              value={selectedDate}
              max={getYesterdayDateString()}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setSelectedDate(val);
              }}
              className="absolute opacity-0 w-8 h-8 cursor-pointer"
            />
          </div>

          {/* Dark / Light Toggle */}
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>
      </header>

      {/* Main Container utilizing a full viewport grid hierarchy */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Daily Box Office List (col-span-12 or col-span-4 on desktop) */}
        <aside className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Daily Ranking List (일별 박스오피스 순위)
              </h2>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formatKoreanDate(selectedDate)} 기준 상위 10위 영화
              </p>
            </div>
            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> LIVE CONNECTED
            </span>
          </div>

          {/* List items representation */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-xs ${isDark ? 'text-slate-405' : 'text-slate-500'}`}>
                실시간 랭킹 데이터를 요청 중입니다...
              </p>
            </div>
          ) : error ? (
            <div className={`p-6 text-center rounded-2xl border ${
              isDark ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-red-50 border-red-150 text-red-700'
            }`}>
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={() => fetchBoxOffice(selectedDate)}
                className="mt-3 px-4 py-2 bg-red-650 hover:bg-red-600 font-bold text-xs text-white rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 다시 시도
              </button>
            </div>
          ) : boxOfficeList.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
            }`}>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-505'}`}>
                불러온 데이터 순위가 존재하지 않습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[68vh] overflow-y-auto custom-scrollbar pr-1">
              {boxOfficeList.map((movie, index) => {
                const rankNum = parseInt(movie.rank, 10);
                const isSelected = movie.movieCd === selectedMovieCd;
                
                // Rank comparison indicators
                const renderRankIntent = () => {
                  if (movie.rankOldAndNew === 'NEW') {
                    return <span className="text-[10px] uppercase font-mono font-black tracking-tight text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded">NEW</span>;
                  }
                  const inten = parseInt(movie.rankInten, 10);
                  if (inten > 0) {
                    return <span className="flex items-center text-red-500 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5 mr-0.5" />{inten}</span>;
                  }
                  if (inten < 0) {
                    return <span className="flex items-center text-blue-500 text-xs font-bold"><TrendingDown className="w-3.5 h-3.5 mr-0.5" />{Math.abs(inten)}</span>;
                  }
                  return <span className="text-slate-400 font-medium">-</span>;
                };

                return (
                  <motion.div
                    key={movie.movieCd}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.25 }}
                    onClick={() => {
                      setSelectedMovieCd(movie.movieCd);
                      setSelectedMovieNm(movie.movieNm);
                    }}
                    className={`card-layout group p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-500 shadow-xl shadow-amber-500/10'
                        : isDark
                          ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white'
                          : 'bg-white border-slate-200/80 hover:bg-slate-100/60 shadow-sm shadow-slate-100'
                    }`}
                    id={`bento-rank-${movie.rank}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Enormous structural numeric ranking text */}
                      <span className={`text-3xl font-black italic tracking-wide select-none ${
                        isSelected 
                          ? 'text-black/30' 
                          : isDark ? 'text-slate-800 group-hover:text-amber-500/40' : 'text-slate-300 group-hover:text-amber-500/40'
                      }`}>
                        {movie.rank.padStart(2, '0')}
                      </span>

                      <div className="min-w-0">
                        <div className={`text-base font-bold truncate leading-tight ${isSelected ? 'text-black' : isDark ? 'text-white' : 'text-slate-800'}`}>
                          {movie.movieNm}
                        </div>
                        <div className={`text-xs mt-0.5 font-medium ${
                          isSelected ? 'text-black/80' : isDark ? 'text-slate-420' : 'text-slate-500'
                        }`}>
                          전일 대비 점유율 {movie.salesShare}% · 개봉일 {movie.openDt}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      {renderRankIntent()}
                      <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-black/70' : 'text-slate-450'}`}>
                        {parseInt(movie.audiCnt, 10).toLocaleString('ko-KR')}명
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right Column: Bento Grid Movie Detail (col-span-12 or col-span-8 on desktop) */}
        <section className="col-span-12 lg:col-span-7 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Movie Cinematic Bento (상세 영화 벤토 정보)
              </h2>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedMovieNm ? `${selectedMovieNm}의 실시간 스펙 스코어보드` : '조회할 영화를 좌측 리스트에서 선택해주십시오.'}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>클릭하여 다른 영화 보기</span>
            </div>
          </div>

          {activeMovieObj && selectedMovieCd && selectedMovieNm ? (
            <MovieBentoDetail
              key={selectedMovieCd}
              movieCd={selectedMovieCd!}
              movieNm={selectedMovieNm!}
              salesShare={activeMovieObj.salesShare}
              audiCnt={activeMovieObj.audiCnt}
              audiAcc={activeMovieObj.audiAcc}
              openDt={activeMovieObj.openDt}
              isDark={isDark}
            />
          ) : (
            <div className={`p-20 text-center rounded-3xl border flex flex-col items-center justify-center space-y-3 ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <Film className="w-10 h-10 text-slate-400 animate-pulse" />
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>
                박스오피스 리스트에서 순위 항목을 클릭하시면 상세 정보 벤토 카드가 실시간 빌드됩니다.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer Bar */}
      <footer className={`px-6 py-4 mt-auto border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-wide h-auto leading-normal ${
        isDark ? 'bg-[#0A0A0A] border-white/5 text-slate-500' : 'bg-[#F9F9FB] border-slate-200 text-slate-400'
      }`}>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <span>영화관입장권통합전산망 KOBIS API</span>
          <span>&copy; 2026 CINESTATS DATA SERVICE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold">LIVE METRIC DATA LINKED</span>
        </div>
      </footer>
    </div>
  );
}
