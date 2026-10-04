/* ==========================================================
   사이트 설정 파일 — 사이트의 모든 내용은 이 파일에서 수정합니다.
   (index.html / style.css / *.js 는 고치지 않아도 됩니다.)
   - 문자열은 따옴표(" ") 안에서 수정하세요.
   - 항목을 추가/삭제하려면 { ... }, 줄 단위로 복사/삭제하면 됩니다.
   - 아래 내용 중 '예시'라고 적힌 것은 자리표시자이니 실제 내용으로 바꿔 주세요.
   ========================================================== */
window.SITE_CONFIG = {
  /* ---------- 기본 정보 ---------- */
  university: "고려대학교",
  department: "***학과",          // ← 학과명으로 교체
  courseName: "***",               // ← 교과목명(강의 제목)으로 교체
  courseCode: "XXXX000",
  version: "v1.0.0",               // 수업명 옆에 표시되는 버전. 비우면 표시하지 않음
  pageTitle: "「***」 | 고려대학교 ***학과",
  footerText: "© 2026 고려대학교 ***학과. All rights reserved.",

  /* ---------- 상단 메뉴 ----------
     id 는 아래 섹션 id 와 일치해야 하며, 배열 순서가 화면에 나오는 순서입니다.
     menu: false 로 하면 메뉴에는 표시하지 않고 섹션만 보여줍니다. */
  nav: [
    { id: "intro",      label: "프로그램 소개", menu: true },
    { id: "curriculum", label: "커리큘럼", menu: true },
    { id: "tools",      label: "실습 도구", menu: true },
    { id: "prep",       label: "수강 준비물", menu: false },
    { id: "guide",      label: "수강 안내", menu: true },
    { id: "poll",       label: "투표",        menu: false },
    { id: "enroll",     label: "수강 신청", menu: true },
    { id: "classroom",  label: "내 강의실", menu: true },
    { id: "faq",        label: "FAQ", menu: true },
    { id: "instructor", label: "교수자", menu: true }
  ],

  /* ---------- 첫 화면 ---------- */
  hero: {
    eyebrow: "2026 상반기 집중 프로그램",
    subtitle: "AI 기반 데이터 활용능력 배양",
    description: "생성형 AI와 데이터 도구를 직접 다루며, 현업에서 바로 쓸 수 있는 데이터 활용 역량을 15주 동안 단계별로 키우는 실습 중심 과정입니다. (예시 문구 — 실제 소개로 바꿔 주세요)",
    badges: ["3학점", "실습 중심", "한국어 강의"],
    buttons: [
      { label: "수강 신청",     target: "enroll",     primary: true },
      { label: "커리큘럼 보기", target: "curriculum", primary: false }
    ]
  },

  /* ---------- 한눈에 보기 ----------
     value 안에 {start} {end} {weeks} {time} {place} {weekday} 를 쓰면
     아래 커리큘럼 설정에서 자동으로 채워집니다. */
  overview: {
    items: [
      { icon: "📅", label: "일정",      value: "{start} ~ {end} ({weeks}주)" },
      { icon: "⏰", label: "시간",      value: "매주 {weekday} {time}" },
      { icon: "💻", label: "수업 방식", value: "대면 강의 + 실습 (노트북 지참)" },
      { icon: "🎓", label: "수강 대상", value: "***학과 학생 및 데이터 활용에 관심 있는 누구나" }
    ]
  },

  /* ---------- 통계 카드 ----------
     source: "weeks" 는 커리큘럼 주차 수, "tools" 는 실습 도구 수를 자동으로 셉니다.
     source 를 비우면 value 를 그대로 씁니다. (저술 수·강의 경력은 예시 값입니다) */
  stats: {
    items: [
      { source: "weeks", value: 15, suffix: "주", label: "과정" },
      { source: "tools", value: 6,  suffix: "개", label: "실습 AI 도구" },
      { source: "",      value: 3,  suffix: "권", label: "저술" },
      { source: "",      value: 10, suffix: "년+", label: "강의 경력" }
    ]
  },

  /* ---------- 프로그램 소개 (장점 슬라이드) ---------- */
  intro: {
    title: "이 강의의 장점",
    subtitle: "좌우로 넘겨서 확인해 보세요",
    summary: "이론 설명에 그치지 않고, 매주 직접 손으로 해 보는 실습으로 데이터를 다루는 감각을 키웁니다. (예시 문구)",
    slides: [
      { icon: "🛠️", title: "100% 실습 중심",     text: "매 수업의 절반 이상을 실습으로 진행해 배운 내용을 바로 적용합니다." },
      { icon: "🤖", title: "최신 AI 도구 활용",   text: "여러 생성형 AI 도구를 비교하며 상황에 맞는 도구를 고르는 법을 익힙니다." },
      { icon: "📊", title: "실제 데이터로 학습",   text: "공공·업무 데이터를 직접 다루며 분석부터 시각화, 보고까지 경험합니다." },
      { icon: "👥", title: "피드백과 협업",        text: "과제마다 개별 피드백을 제공하고, 팀 프로젝트로 협업 경험을 쌓습니다." },
      { icon: "🌱", title: "비전공자도 환영",      text: "코딩 경험이 없어도 따라올 수 있도록 단계별로 설계했습니다." }
    ]
  },

  /* ---------- 커리큘럼 (주차별) ----------
     startDate 부터 7일 간격으로 주차 날짜가 자동 계산됩니다. (화요일이면 매주 화요일)
     각 주차의 date / time / place 를 적으면 그 주만 따로 바꿀 수 있습니다. (예: 휴강으로 날짜 변경)
     content 는 한 줄이 하나의 항목입니다.
     videos 는 참고 영상 {title, url} 목록(http/https 만 허용).
     assignment 의 title 과 due 를 모두 적은 주차에만 과제가 표시됩니다. due 형식: 2026-03-24T23:59 */
  curriculum: {
    title: "커리큘럼",
    subtitle: "15주 과정을 주차별로 확인하세요",
    startDate: "2026-03-03",
    time: "19:00 ~ 21:30",
    place: "○○관 000호",
    calendarTitle: "수업 달력",
    calendarSubtitle: "매주 수업 일정이 표시돼요. 날짜를 누르면 그날의 수업 내용을 볼 수 있어요.",
    weeks: [
      { topic: "오리엔테이션: AI 시대의 데이터 활용", date: "", time: "", place: "",
        content: "강의 소개와 평가 방식 안내\nAI와 데이터 활용 사례 살펴보기\n실습 환경 점검",
        videos: [{ title: "참고 영상 (예시 링크)", url: "https://www.youtube.com/" }],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "데이터의 이해: 수집과 정리", date: "", time: "", place: "",
        content: "데이터의 종류와 구조\n정형·비정형 데이터 구분\n스프레드시트로 정리하기", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "생성형 AI로 시작하는 데이터 탐색", date: "", time: "", place: "",
        content: "프롬프트로 데이터 요약하기\nAI 답변 검증하는 방법\n실습: 공공 데이터 탐색", videos: [],
        assignment: { id: "a3", title: "데이터 탐색 보고서", description: "제공된 데이터셋을 AI 도구로 탐색하고, 발견한 내용을 1쪽으로 정리해 제출하세요.", due: "2026-03-24T23:59" } },
      { topic: "프롬프트 설계 기초", date: "", time: "", place: "",
        content: "좋은 프롬프트의 구성 요소\n역할·맥락·형식 지정하기\n실습: 프롬프트 개선 비교", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "스프레드시트와 AI 연계", date: "", time: "", place: "",
        content: "수식·함수 작성을 AI와 함께\n데이터 정제 자동화\n실습: 지저분한 데이터 정리", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "데이터 시각화", date: "", time: "", place: "",
        content: "목적에 맞는 차트 고르기\nAI로 시각화 초안 만들기\n실습: 대시보드 한 장 만들기", videos: [],
        assignment: { id: "a6", title: "시각화 과제", description: "선택한 데이터로 차트 2개 이상을 만들고 해석을 덧붙여 제출하세요.", due: "2026-04-14T23:59" } },
      { topic: "중간 정리와 사례 토론", date: "", time: "", place: "",
        content: "1~6주차 핵심 복습\n팀별 사례 토론", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "AI 코딩 도우미로 자동화하기", date: "", time: "", place: "",
        content: "반복 작업을 코드로 자동화\nAI가 쓴 코드 읽고 점검하기\n실습: 간단한 자동화 스크립트", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "문서·텍스트 데이터 분석", date: "", time: "", place: "",
        content: "긴 문서 요약과 핵심 추출\n설문 응답 분류하기\n실습: 텍스트 데이터 분석", videos: [],
        assignment: { id: "a9", title: "텍스트 분석 과제", description: "자유 주제의 텍스트 자료를 골라 분석하고 결과를 정리해 제출하세요.", due: "2026-05-12T23:59" } },
      { topic: "데이터 윤리와 개인정보", date: "", time: "", place: "",
        content: "AI 활용 시 개인정보 주의사항\n저작권과 출처 표기\n사례 토론", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "팀 프로젝트 기획", date: "", time: "", place: "",
        content: "문제 정의와 데이터 선정\n팀별 역할 분담\n프로젝트 계획서 작성", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "팀 프로젝트 수행 I", date: "", time: "", place: "",
        content: "데이터 수집과 정제\n중간 점검 및 피드백", videos: [],
        assignment: { id: "a12", title: "프로젝트 중간 보고", description: "프로젝트 진행 상황과 향후 계획을 2쪽 이내로 정리해 제출하세요.", due: "2026-05-26T23:59" } },
      { topic: "팀 프로젝트 수행 II", date: "", time: "", place: "",
        content: "분석과 시각화\n발표 자료 준비", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "프로젝트 발표", date: "", time: "", place: "",
        content: "팀별 발표와 질의응답\n동료 평가", videos: [],
        assignment: { id: "", title: "", description: "", due: "" } },
      { topic: "종합 정리와 마무리", date: "", time: "", place: "",
        content: "학기 총정리\n앞으로의 학습 로드맵\n강의 피드백", videos: [],
        assignment: { id: "a15", title: "최종 성찰문", description: "학기 동안 배운 점과 앞으로의 활용 계획을 정리해 제출하세요.", due: "2026-06-16T23:59" } }
    ]
  },

  /* ---------- 실습 AI 도구 소개 (예시) ---------- */
  tools: {
    title: "실습에 쓰는 AI 도구",
    subtitle: "수업에서 직접 다뤄 볼 도구들이에요",
    items: [
      { icon: "💬", name: "도구 이름 1", desc: "대화형 AI 어시스턴트로 질문, 요약, 초안 작성을 연습합니다.",      use: "질문·요약" },
      { icon: "📈", name: "도구 이름 2", desc: "표와 데이터를 정리하고 분석하는 방법을 익힙니다.",              use: "데이터 분석" },
      { icon: "🎨", name: "도구 이름 3", desc: "분석 결과를 차트와 그림으로 표현합니다.",                      use: "시각화" },
      { icon: "🧑‍💻", name: "도구 이름 4", desc: "코드 작성과 오류 수정을 도와주는 AI 코딩 도우미입니다.",        use: "자동화" },
      { icon: "📚", name: "도구 이름 5", desc: "긴 문서와 자료를 읽고 정리하는 데 활용합니다.",                  use: "문서 정리" },
      { icon: "🧩", name: "도구 이름 6", desc: "여러 도구를 연결해 업무 흐름을 자동화합니다.",                  use: "워크플로" }
    ]
  },

  /* ---------- 수강 준비물 (예시) ---------- */
  prep: {
    title: "수강 준비물",
    subtitle: "수업 전에 아래 항목을 준비해 주세요. 체크하면 이 브라우저에 기억돼요.",
    items: [
      { title: "노트북",           text: "실습을 위해 매 수업 지참 (태블릿은 권장하지 않아요)" },
      { title: "AI 도구 계정",      text: "첫 수업 전에 가입해 두면 좋아요" },
      { title: "인터넷 연결",       text: "강의실 와이파이 또는 개인 데이터" },
      { title: "필기구 또는 메모 앱", text: "핵심 내용과 프롬프트를 기록해 두세요" },
      { title: "학번과 학교 이메일",  text: "수강 신청과 공지 확인에 필요해요" },
      { title: "열린 마음",         text: "코딩 경험은 없어도 괜찮아요 🌸" }
    ],
    note: "준비물은 학기 중 변경될 수 있으며, 변경 시 공지로 안내합니다."
  },

  /* ---------- 수강 안내 ---------- */
  guide: {
    title: "수강 안내",
    subtitle: "수강 전에 꼭 확인해주세요",
    info: [
      { label: "학수번호", value: "XXXX000" },
      { label: "학점/시간", value: "3학점 / 3시간" },
      { label: "수업 시간", value: "매주 화요일 19:00 ~ 21:30" },
      { label: "강의실",   value: "○○관 000호" },
      { label: "수강 대상", value: "***학과 학생 및 관심 있는 누구나" },
      { label: "선수 과목", value: "없음" }
    ],
    evaluationTitle: "성적 평가",
    evaluation: [
      { item: "출석",          percent: 10 },
      { item: "과제",          percent: 40 },
      { item: "팀 프로젝트",    percent: 40 },
      { item: "수업 참여",      percent: 10 }
    ],
    notices: [
      "수강신청 기간은 학사 일정을 확인해주세요.",
      "교재 및 참고자료는 첫 수업 시간에 안내합니다.",
      "출석은 전체 수업의 3/4 이상 충족해야 성적이 부여됩니다.",
      "과제는 마감 일시 이후 제출하면 지각으로 표시됩니다."
    ]
  },

  /* ---------- 투표 ---------- */
  poll: {
    title: "가장 먼저 배우고 싶은 주제",
    subtitle: "여러분의 관심사를 수업 순서에 반영할게요",
    question: "가장 먼저 배우고 싶은 주제를 하나 골라주세요",
    topics: [                         // id 는 한 번 정하면 바꾸지 마세요 (득표 기록과 연결됨)
      { id: "t1", label: "프롬프트 설계" },
      { id: "t2", label: "데이터 시각화" },
      { id: "t3", label: "업무 자동화" },
      { id: "t4", label: "텍스트 분석" }
    ]
  },

  /* ---------- 수강 신청서 ---------- */
  enroll: {
    title: "수강 신청",
    subtitle: "신청서를 작성해 제출해주세요",
    grades: ["1학년", "2학년", "3학년", "4학년", "대학원생", "기타"],
    consentText: "수강 신청 처리를 위한 개인정보(이름, 학번, 연락처 등) 수집·이용에 동의합니다.",
    successMessage: "수강 신청서가 제출되었어요. 🌸 결과는 별도로 안내드릴게요."
  },

  /* ---------- 내 강의실 (로그인 / 출석 / 과제) ----------
     제출할 과제 목록은 위 커리큘럼의 각 주차 assignment 에서 자동으로 만들어집니다. */
  classroom: {
    title: "내 강의실",
    subtitle: "수강생 로그인 후 출석 체크와 과제 제출을 할 수 있어요",
    loginHelp: "학번과 비밀번호로 로그인하세요. 처음에는 비밀번호가 학번과 같습니다.",
    maxFileMB: 10
  },

  /* ---------- 첫 방문 안내 팝업 / 폭죽 ---------- */
  popup: {
    enabled: true,
    delayMs: 2500,                    // 접속 후 팝업이 뜨기까지의 시간(밀리초)
    title: "수강 신청 안내 🌸",
    lines: [
      "이번 학기 수강 신청을 받고 있어요.",
      "‘수강 신청’ 메뉴에서 신청서를 작성해 제출해주세요."
    ],
    buttonLabel: "수강 신청하기"
  },
  confetti: { enabled: true },

  /* ---------- 보안 (비밀번호 평문은 저장하지 않고 해시만 보관) ----------
     관리자 화면 > 설정·백업 > ‘비밀번호 변경’ 에서 새 비밀번호를 정하고
     config.js 로 저장하면 이 값이 새로 만들어집니다. */
  security: {
    salt: "ku-sakura-4f9a",
    adminHash: "9be9526ebc07cc3f43090217075a932545df4be21f85c5f3cf30adc9d70fc4e7"
  },

  /* ---------- FAQ ---------- */
  faq: {
    title: "자주 묻는 질문",
    subtitle: "궁금한 점을 먼저 확인해 보세요",
    items: [
      { q: "코딩이나 데이터 분석 경험이 없어도 수강할 수 있나요?", a: "답변을 입력하세요." },
      { q: "선수 과목이 필요한가요?",                           a: "답변을 입력하세요." },
      { q: "AI 도구 이용료가 따로 드나요?",                      a: "답변을 입력하세요." },
      { q: "과제와 팀 프로젝트는 어떻게 진행되나요?",             a: "답변을 입력하세요." },
      { q: "결석하면 어떻게 하나요?",                            a: "답변을 입력하세요." }
    ]
  },

  /* ---------- 교수자 (페이지 맨 아래 푸터에 표시) ---------- */
  instructor: {
    title: "교수자 소개",
    subtitle: "강의를 담당하는 분을 소개합니다",
    members: [
      {
        name: "홍길동 교수",
        role: "***학과 교수",
        photo: "",                         // 사진 파일 경로 (예: "images/prof.jpg"). 비워두면 이니셜 표시
        bio: "교수자 약력과 연구 분야를 간략히 적어주세요.",
        tags: ["연구분야 1", "연구분야 2"],
        contacts: [
          { label: "이메일", value: "professor@korea.ac.kr", href: "mailto:professor@korea.ac.kr" },
          { label: "연구실", value: "○○관 000호", href: "" },
          { label: "상담 시간", value: "수 14:00 ~ 16:00 (사전 이메일 문의)", href: "" }
        ]
      }
    ]
  }
};
