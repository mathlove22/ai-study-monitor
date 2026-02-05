'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { analyzeStudyImage } from '@/lib/gemini';
import { saveStudyLog } from '@/lib/storage';
import Link from 'next/link';

export default function CameraPage() {
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [intervalTime, setIntervalTime] = useState(10);
    const [lastResult, setLastResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('loading');

    const speak = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        }
    };

    const captureAndAnalyze = useCallback(async () => {
        if (!webcamRef.current) return;
        const originalImage = webcamRef.current.getScreenshot();
        if (!originalImage) return;

        setIsAnalyzing(true);
        const result = await analyzeStudyImage(originalImage);
        setIsAnalyzing(false);
        setLastResult(result);

        saveStudyLog({
            page: result.page,
            status: result.status,
            present: result.present,
            needHint: result.needHint,
            hint: result.hint
        });

        if (result.needHint && result.hint) {
            speak(result.hint);
        } else if (result.present === false) {
            speak("학생이 자리에 없네요. 다시 집중해볼까요?");
        }
    }, []);

    useEffect(() => {
        let interval;
        if (isCapturing) {
            interval = setInterval(captureAndAnalyze, intervalTime * 1000);
        }
        return () => clearInterval(interval);
    }, [isCapturing, intervalTime, captureAndAnalyze]);

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden select-none">
            {/* 1. 풀스크린 카메라 배경 */}
            <div className="absolute inset-0 z-0">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        facingMode: "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }}
                    onUserMedia={() => setCameraStatus('ready')}
                    onUserMediaError={() => setCameraStatus('error')}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* 2. 상단 네비게이션 */}
            <nav className="absolute top-0 inset-x-0 p-6 z-10 flex justify-between items-start">
                <Link href="/" className="p-3 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 active:scale-90 transition-transform">
                    <span className="text-xl">🏠</span>
                </Link>
                <div className="flex flex-col items-end gap-2">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interval</span>
                        <input
                            type="number"
                            value={intervalTime}
                            onChange={(e) => setIntervalTime(Math.max(5, parseInt(e.target.value) || 5))}
                            className="w-8 bg-transparent text-center font-bold text-sm outline-none"
                        />
                        <span className="text-xs font-bold">s</span>
                    </div>
                </div>
            </nav>

            {/* 3. 중앙 가이드 라인 (필요시 노출) */}
            {!isCapturing && cameraStatus === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none p-12">
                    <div className="w-full aspect-[3/4] border-2 border-white/20 border-dashed rounded-[2rem] flex items-center justify-center">
                        <span className="text-white/30 text-xs font-bold tracking-widest uppercase">책장 중앙을 맞춰주세요</span>
                    </div>
                </div>
            )}

            {/* 4. 상태 오버레이 (Floating Cards) */}
            <div className="absolute top-24 inset-x-6 z-10 space-y-3">
                {lastResult && (
                    <div className="bg-white/10 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${lastResult.present ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Analysis</span>
                            </div>
                            <span className="text-blue-400 text-xs font-black">PAGE {lastResult.page}</span>
                        </div>
                        <p className="text-base font-bold text-white mb-2 leading-tight">{lastResult.status}</p>
                        {lastResult.hint && lastResult.needHint && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                                <span className="text-xl shrink-0">💡</span>
                                <p className="text-sm font-medium text-blue-200 italic leading-snug">{lastResult.hint}</p>
                            </div>
                        )}
                    </div>
                )}

                {isAnalyzing && (
                    <div className="bg-blue-600/20 backdrop-blur-xl px-5 py-3 rounded-full border border-blue-400/30 flex items-center gap-3 w-fit mx-auto">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-blue-100">AI가 책장을 넘기는 중...</span>
                    </div>
                )}
            </div>

            {/* 5. 로딩/에러 화면 */}
            {cameraStatus === 'loading' && (
                <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-bold animate-pulse">카메라 렌즈 닦는 중...</p>
                </div>
            )}

            {cameraStatus === 'error' && (
                <div className="absolute inset-0 bg-rose-950 z-50 flex flex-col items-center justify-center p-12 text-center gap-6">
                    <span className="text-6xl text-rose-500">📸</span>
                    <h2 className="text-xl font-bold">카메라를 열 수 없어요</h2>
                    <p className="text-rose-200/60 text-sm">브라우저 설정에서 카메라 권한을<br />허용했는지 확인해 주세요.</p>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-2xl font-bold active:scale-95 transition-transform">다시 시도</button>
                </div>
            )}

            {/* 6. 하단 액션 바 */}
            <div className="absolute bottom-0 inset-x-0 p-8 pb-12 z-10 flex flex-col items-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
                <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 relative ${isCapturing ? 'bg-rose-500 shadow-last-pulse' : 'bg-white shadow-2xl'}`}
                >
                    <div className={`transition-all ${isCapturing ? 'w-6 h-6 bg-white rounded-sm' : 'w-16 h-16 bg-white border-[6px] border-black/5 rounded-full ring-4 ring-emerald-500/50'}`} />
                    {isCapturing && (
                        <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                    )}
                </button>
                <div className="flex flex-col items-center gap-1 opacity-60">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">{isCapturing ? 'Monitoring Active' : 'Start Monitoring'}</p>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-1 h-1 rounded-full ${isCapturing ? 'bg-rose-400 animate-bounce' : 'bg-white/40'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .shadow-last-pulse {
                    box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }
            `}</style>
        </div>
    );
}
