import { GoogleGenerativeAI } from "@google/generative-ai";

// AI 제공자 설정 (google 또는 lmstudio)
const AI_PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER || "google";

/**
 * Google Gemini API를 사용한 이미지 분석
 */
async function analyzeWithGemini(imageBase64) {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const prompt = getPrompt();

    // Base64 데이터에서 헤더 제거 (data:image/jpeg;base64, 부분)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        const text = result.response.text();
        return parseAIResponse(text);
    } catch (error) {
        console.error('Gemini API 오류:', error);
        throw error;
    }
}

/**
 * LM Studio를 사용한 이미지 분석
 */
async function analyzeWithLMStudio(imageBase64) {
    const LM_STUDIO_URL = process.env.NEXT_PUBLIC_LM_STUDIO_URL || "http://localhost:1234/v1/chat/completions";
    const MODEL_ID = process.env.NEXT_PUBLIC_MODEL_ID || "qwen/qwen2.5-v1-7b";

    const prompt = getPrompt();
    const formattedBase64 = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch(LM_STUDIO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL_ID,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: formattedBase64 } }
                    ]
                }
            ],
            temperature: 0,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LM Studio 요청 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return parseAIResponse(text);
}

function getPrompt() {
    return `
    당신은 교육용 AI 보조교사이자 OCR 전문가입니다. 
    제시된 이미지는 학생이 풀고 있는 문제집입니다. 이미지를 정밀 분석하여 아래 정보를 추출하세요.
    절대 상상하거나 추측하지 마세요. 보이는 정보만 보고하세요.

    1. 학생 존재 여부 (present): 카메라에 학생의 손, 팔, 혹은 문제풀이용 샤프/펜이 보이면 true. 만약 책만 덩그러니 있고 아무런 움직임이나 사람의 흔적이 전혀 없다면 false.
    2. 페이지 번호 (page): 문제집 구석이나 하단에 적힌 숫자를 찾으세요. 보이지 않으면 "인식불가".
    3. 풀이 진행 상태 (status): 현재 페이지의 문제들이 얼마나 풀려 있나요? (예: "2번 문제 풀이 중", "반 정도 완료", "새 페이지")
    4. 힌트 필요 여부 (needHint): 같은 곳에 낙서만 반복되거나, 풀이가 멈춘 상태로 오래 지속되는 등 도움이 필요해 보이나요? (true/false)
    5. 힌트 내용 (hint): 힌트가 필요하다면 학생에게 직접 말하듯 다정하게 1-2문장으로 제공하세요.

    반드시 아래 JSON 형식으로만 응답하세요(코드 블록 없이 순수 JSON만):
    {
      "present": true/false,
      "page": "숫자",
      "status": "상태 설명",
      "needHint": true/false,
      "hint": "힌트 내용"
    }
    `;
}

function parseAIResponse(text) {
    console.log('AI Raw Response:', text);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("분석 결과에서 JSON 형식을 찾을 수 없습니다.");
    return JSON.parse(jsonMatch[0]);
}

export async function analyzeStudyImage(imageBase64) {
    try {
        if (AI_PROVIDER === "google") {
            return await analyzeWithGemini(imageBase64);
        } else {
            return await analyzeWithLMStudio(imageBase64);
        }
    } catch (error) {
        console.error('AI 분석 오류:', error);
        return {
            error: `${AI_PROVIDER === "google" ? "Gemini" : "로컬 AI"} 연결 확인 필요: ${error.message}`,
            present: "확인 불가",
            page: "확인 불가",
            status: "오류",
            needHint: false,
            hint: ""
        };
    }
}
