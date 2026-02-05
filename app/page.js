import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-8 py-20 overflow-hidden relative">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-sm flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20 mb-6 animate-in zoom-in-50 duration-700">
          🤖
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            AI STUDY <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">MONITOR</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed opacity-60">
            실시간 AI 학습 모니터링 시스템
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/camera"
          className="block w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-blue-500/10 text-center"
        >
          모니터링 시작
        </Link>

        <Link
          href="/dashboard"
          className="block w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl transition-all active:scale-95 border border-white/5 text-center"
        >
          활동 기록
        </Link>

        <p className="text-center text-slate-500 text-[10px] uppercase font-black tracking-widest pt-4">
          Powered by Gemini AI
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 opacity-10">
        <div className="w-20 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
}
