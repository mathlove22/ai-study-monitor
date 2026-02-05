const STORAGE_KEY = 'ai_study_logs';

export function saveStudyLog(data) {
    if (typeof window === 'undefined') return;

    try {
        const existingLogs = getStudyLogs();
        const newLog = {
            ...data,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        const updatedLogs = [newLog, ...existingLogs].slice(0, 100); // 최근 100개까지만 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

        // 이벤트를 발생시켜 다른 탭/컴포넌트에서 감지하게 함
        window.dispatchEvent(new Event('storage_update'));
        return newLog;
    } catch (error) {
        console.error('LocalStorage 저장 오류:', error);
    }
}

export function getStudyLogs() {
    if (typeof window === 'undefined') return [];

    try {
        const logs = localStorage.getItem(STORAGE_KEY);
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('LocalStorage 읽기 오류:', error);
        return [];
    }
}

export function clearStudyLogs() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('storage_update'));
}
