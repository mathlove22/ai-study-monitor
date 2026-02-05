'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { analyzeStudyImage } from '@/lib/gemini';
import { saveStudyLog } from '@/lib/storage';

export default function CameraPage() {
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [intervalTime, setIntervalTime] = useState(10); // 10초 기본
    const [lastResult, setLastResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('loading'); // loading, ready, error
    const [orientation, setOrientation] = useState('portrait'); // portrait, landscape

    // 음성 합성 (TTS) 함수
    const speak = (text) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        }
    };

    // 이미지 전처리 함수 (인식률 향상)
    const preprocessImage = (imageSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;

                // 그레이스케일 + 대비 증가 + 밝기 조정
                ctx.filter = 'grayscale(1) contrast(1.4) brightness(1.1)';
                ctx.drawImage(img, 0, 0);

                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.src = imageSrc;
        });
    };

    const captureAndAnalyze = useCallback(async () => {
        if (!webcamRef.current) return;

        const originalImage = webcamRef.current.getScreenshot();
        if (!originalImage) return;

        setIsAnalyzing(true);
        // 이미지 전처리 적용
        const processedImage = await preprocessImage(originalImage);

        const result = await analyzeStudyImage(processedImage);
        setIsAnalyzing(false);

        setLastResult(result);

        // 로그 저장
        saveStudyLog({
            page: result.page,
            status: result.status,
            present: result.present,
            needHint: result.needHint,
            hint: result.hint
        });

        // 힌트가 있거나 자리에 없을 때 알림
        if (result.needHint && result.hint) {
            speak(`도움이 필요해 보입니다. ${result.hint}`);
        } else if (result.present === false) {
            speak("학생이 자리에 없습니다. 공부를 시작해볼까요?");
        }
    }, []);

    // 자동 캡처 트리거
    useEffect(() => {
        let interval;
        if (isCapturing) {
            interval = setInterval(() => {
                captureAndAnalyze();
            }, intervalTime * 1000);
        }
        return () => clearInterval(interval);
    }, [isCapturing, intervalTime, captureAndAnalyze]);

    return (
        <div className={`min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center ${orientation === 'landscape' ? 'overflow-hidden' : ''}`}>
            <header className="w-full max-w-4xl flex flex-wrap justify-between items-center mb-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 gap-4">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    AI 학습 모니터링
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2 border border-white/10"
                        title="화면 방향 전환"
                    >
                        {orientation === 'portrait' ? '📱 세로' : '📐 가로'}
                    </button>
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">간격</span>
                        <input
                            type="number"
                            value={intervalTime}
                            onChange={(e) => setIntervalTime(Math.max(5, parseInt(e.target.value) || 5))}
                            className="w-12 bg-transparent border-none rounded p-0 text-sm outline-none focus:ring-0 text-center font-bold"
                        />
                    </div>
                    <button
                        onClick={() => setIsCapturing(!isCapturing)}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${isCapturing
                            ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                            }`}
                    >
                        {isCapturing ? '중지' : '시작'}
                    </button>
                </div>
            </header>

            <main className={`w-full max-w-6xl flex transition-all duration-500 gap-6 ${orientation === 'landscape' ? 'flex-row h-[calc(100vh-140px)]' : 'flex-col'}`}>
                {/* 카메라 영역 */}
                <section className={`relative transition-all duration-500 bg-black rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl ${orientation === 'landscape' ? 'flex-[1.5] h-full' : 'aspect-video w-full max-w-2xl mx-auto'}`}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: "environment", // 후면 카메라 우선
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        }}
                        onUserMedia={() => {
                            console.log("Webcam started successfully");
                            setCameraStatus('ready');
                        }}
                        onUserMediaError={(err) => {
                            console.error("Webcam error:", err);
                            setCameraStatus('error');
                        }}
                        className="w-full h-full object-cover"
                    />

                    {cameraStatus === 'loading' && (
                        <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 text-sm">카메라 로딩 중...</p>
                        </div>
                    )}

                    {cameraStatus === 'error' && (
                        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center gap-4">
                            <div className="text-4xl">⚠️</div>
                            <p className="text-rose-400 font-bold">카메라 연결 실패</p>
                            <p className="text-slate-400 text-xs">권한을 확인해주세요.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs"
                            >
                                재시도
                            </button>
                        </div>
                    )}

                    {/* 문제집 가이드 라인 */}
                    <div className="absolute inset-x-8 inset-y-8 border-2 border-white/30 rounded-xl border-dashed pointer-events-none flex items-center justify-center">
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                            문제집 가이드 영역
                        </div>
                    </div>

                    {isCapturing && (
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/20 backdrop-blur-md px-2 py-1 rounded-lg text-rose-500">Live</span>
                        </div>
                    )}
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm animate-bounce shadow-2xl">
                                AI 분석 진행 중...
                            </div>
                        </div>
                    )}
                </section>

                {/* 상태 정보 영역 */}
                <section className={`flex flex-col gap-6 transition-all duration-500 ${orientation === 'landscape' ? 'flex-1 overflow-y-auto pr-2' : 'w-full max-w-2xl mx-auto pb-10'}`}>
                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 shadow-xl">
                        <h2 className="text-slate-500 text-[10px] font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            Real-time Analysis
                        </h2>

                        {lastResult ? (
                            <div className="space-y-6">
                                {lastResult.error && (
                                    <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                                        <p className="text-rose-400 text-[10px] font-black uppercase mb-1">Error</p>
                                        <p className="text-slate-300 text-sm leading-relaxed">{lastResult.error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-24 transition-all hover:bg-white/10">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Attendance</p>
                                        <p className={`text-lg font-black ${lastResult.present === true ? 'text-emerald-400' : lastResult.present === false ? 'text-rose-400' : 'text-slate-400'}`}>
                                            {lastResult.present === true ? 'PRESENT' : lastResult.present === false ? 'ABSENT' : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-24 transition-all hover:bg-white/10">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Current Page</p>
                                        <p className="text-2xl font-black text-blue-400">{lastResult.page}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-2">Status</p>
                                    <p className="text-base font-bold text-slate-200 leading-snug">{lastResult.status}</p>
                                </div>

                                {lastResult.needHint && (
                                    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-5 rounded-2xl border border-blue-500/30 animate-pulse relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 text-xl opacity-20 group-hover:opacity-100 transition-opacity">💡</div>
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">AI Smart Hint</p>
                                        <p className="text-slate-100 text-sm font-medium leading-relaxed italic">"{lastResult.hint}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-center gap-4">
                                <div className="text-4xl opacity-20 animate-pulse">📡</div>
                                <div className="text-xs font-bold uppercase tracking-widest leading-loose">
                                    Waiting for live <br /> monitoring to start...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-white/5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Usage Tips
                        </h3>
                        <ul className="text-xs text-slate-400 space-y-4">
                            <li className="flex gap-3">
                                <span className="text-emerald-500 font-bold">01</span>
                                <span className="leading-relaxed">카메라가 문제집을 정면으로 향하게 해주세요.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-500 font-bold">02</span>
                                <span className="leading-relaxed">밝은 조명 아래에서 인식률이 가장 높습니다.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-500 font-bold">03</span>
                                <span className="leading-relaxed">가로 모드(수평)는 책을 전체적으로 넓게 보는 데 유리합니다.</span>
                            </li>
                        </ul>
                    </div>
                </section >
            </main >
        </div >
    );
}
