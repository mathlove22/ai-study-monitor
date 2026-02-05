import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider mb-4">
            AI STUDY ASSISTANT
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
            스마트한 <br />
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">학습 모니터링</span>
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto px-4">
            Gemini AI가 실시간으로 학습 상태를 분석하고 <br className="hidden md:block" />
            자녀에게 필요한 힌트를 음성으로 전달합니다.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-4 px-6">
          <Link
            href="/camera"
            className="w-full md:w-auto group relative px-8 md:px-10 py-4 md:py-5 bg-white text-slate-950 rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20 overflow-hidden text-center"
          >
            <span className="relative z-10">학생 모니터링 시작</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-slate-800/50 backdrop-blur-md border border-white/10 text-white rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl transition-all hover:bg-slate-800 active:scale-95 text-center"
          >
            학부모 대시보드
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <FeatureCard
            emoji="🤖"
            title="AI 실시간 분석"
            desc="문제집 페이지와 풀이 진행도를 AI가 상시 확인합니다."
          />
          <FeatureCard
            emoji="💡"
            title="스마트 힌트"
            desc="막히는 부분이 있으면 AI가 맞춤형 힌트를 음성으로 제공합니다."
          />
          <FeatureCard
            emoji="📊"
            title="프라이버시 보호"
            desc="모든 데이터는 별도 서버 없이 브라우저 로컬 환경에 저장됩니다."
          />
        </div>
      </div>

      <footer className="mt-20 text-slate-600 text-sm">
        © 2026 AI Study Monitor Prototype
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, desc }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left transition-all hover:bg-white/[0.07]">
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
