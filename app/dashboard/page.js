'use client';

import { useEffect, useState } from 'react';
import { getStudyLogs, clearStudyLogs } from '@/lib/storage';
import Link from 'next/link';

export default function DashboardPage() {
    const [logs, setLogs] = useState([]);

    const refreshLogs = () => {
        setLogs(getStudyLogs());
    };

    useEffect(() => {
        refreshLogs();

        // storage_update 커스텀 이벤트 감지
        const handleUpdate = () => refreshLogs();
        window.addEventListener('storage_update', handleUpdate);

        // 탭 전환 등에서도 최신화
        window.addEventListener('focus', refreshLogs);

        return () => {
            window.removeEventListener('storage_update', handleUpdate);
            window.removeEventListener('focus', refreshLogs);
        };
    }, []);

    const handleClear = () => {
        if (confirm('모든 학습 로그를 삭제하시겠습니까?')) {
            clearStudyLogs();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">학습 대시보드</h1>
                        <p className="text-slate-500 text-sm mt-1">자녀의 실시간 학습 현황을 확인하세요.</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={handleClear}
                            className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors bg-slate-50 rounded-xl border border-slate-100"
                        >
                            로그 초기화
                        </button>
                        <Link
                            href="/camera"
                            className="flex-[2] md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 text-center"
                        >
                            모니터링 시작
                        </Link>
                    </div>
                </header>

                <main>
                    {logs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`bg-white border p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row md:items-center gap-3 md:gap-4 ${log.needHint ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'
                                        }`}
                                >
                                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 md:w-24 bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none">
                                        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className={`px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider ${log.present ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {log.present ? 'PRESENT' : 'ABSENT'}
                                        </div>
                                    </div>

                                    <div className="flex-grow space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 uppercase">
                                                Page {log.page}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800 line-clamp-1">
                                                {log.status}
                                            </span>
                                        </div>
                                        {log.hint && (
                                            <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-start gap-2 shadow-sm">
                                                <span className="text-blue-500 font-bold text-xs mt-0.5">💡</span>
                                                <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed">
                                                    {log.hint}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {log.needHint && (
                                        <div className="hidden md:flex flex-shrink-0 ml-auto mr-2">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 text-lg">
                                                💡
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-slate-300 rounded-[32px] p-20 text-center">
                            <div className="text-4xl mb-4">📚</div>
                            <h2 className="text-xl font-bold text-slate-800">아직 학습 로그가 없습니다</h2>
                            <p className="text-slate-500 mt-2">모니터링 페이지에서 카메라를 켜고 학습을 시작해보세요!</p>
                            <Link
                                href="/camera"
                                className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all"
                            >
                                지금 시작하기
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
