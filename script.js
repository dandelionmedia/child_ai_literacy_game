/* =========================================================
   AI 탐정 게임 아레나 - 행현초 5학년 AI리터러시 1부 복습 게임
   AI콘텐츠마케팅연구소 유쌤클래스 · 친절한유성쌤
   ---------------------------------------------------------
   문제 유형
   - ox     : O / X 고르기          { q, a:true/false, labels:[O글자, X글자] }
   - choice : 보기 고르기           { q, opts:[문자열 또는 {t, c}], a:정답번호 }
   - pick   : 정답을 모두 고르기     { q, opts:[...], ans:[정답번호들] }
   - order  : 순서대로 누르기        { q, items:[올바른 순서] }
   공통 옵션 : emoji, hint, exp(해설), news{title, meta}, art(SVG), time(초), shuffle
   ========================================================= */

/* ---------- 그림 자료 (강사가 만든 수업용 그림) ---------- */
const ART_HAND = `
<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="손가락이 여섯 개인 이상한 손 그림">
  <rect x="0" y="0" width="320" height="260" rx="22" fill="#d9f4ff"/>
  <circle cx="270" cy="48" r="26" fill="#ffd23f"/>
  <g fill="#ffcf9e" stroke="#23184f" stroke-width="5" stroke-linejoin="round">
    <rect x="92"  y="52" width="30" height="110" rx="15"/>
    <rect x="126" y="34" width="30" height="128" rx="15"/>
    <rect x="160" y="28" width="30" height="134" rx="15"/>
    <rect x="194" y="38" width="30" height="124" rx="15"/>
    <rect x="228" y="60" width="28" height="104" rx="14"/>
    <rect x="40" y="128" width="88" height="32" rx="16" transform="rotate(-28 84 144)"/>
    <rect x="88" y="120" width="172" height="118" rx="44"/>
  </g>
  <g fill="#ffcf9e"><rect x="96" y="124" width="156" height="30"/></g>
  <g font-family="Jua, sans-serif" font-size="22" fill="#ff4d8d" font-weight="700">
    <text x="99" y="44">1</text><text x="133" y="26">2</text><text x="168" y="20">3</text>
    <text x="202" y="30">4</text><text x="236" y="52">5</text><text x="30" y="118">6</text>
  </g>
</svg>`;

const ART_SIGN = `
<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="글자가 뭉개진 가게 간판 그림">
  <defs>
    <filter id="smudge"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>
  </defs>
  <rect width="320" height="240" rx="22" fill="#ffe9c7"/>
  <rect x="30" y="92" width="260" height="130" fill="#fff" stroke="#23184f" stroke-width="5"/>
  <rect x="52" y="118" width="96" height="70" fill="#bde7ff" stroke="#23184f" stroke-width="4"/>
  <rect x="172" y="118" width="96" height="104" fill="#c98b52" stroke="#23184f" stroke-width="4"/>
  <circle cx="252" cy="172" r="5" fill="#23184f"/>
  <rect x="22" y="24" width="276" height="66" rx="12" fill="#8a4b1f" stroke="#23184f" stroke-width="5"/>
  <text x="160" y="72" text-anchor="middle" font-family="Jua, sans-serif" font-size="44" fill="#fff4d6" filter="url(#smudge)">뺭잏Ꙩ집숖</text>
  <text x="75" y="160" font-size="34">🍞</text>
</svg>`;

/* ---------- 스테이지 & 문제 데이터 ---------- */
const STAGES = [
  {
    id: 's1', no: 1, icon: '🤖', color: '#2ee6d6', btn: 'cyan',
    title: 'AI일까 아닐까?', sub: '① AI가 무엇일까?',
    desc: 'AI가 숨어 있는 물건을 찾아라! AI는 어떤 프로그램일까?',
    badge: { ico: '🧠', name: '예측기계 박사' }, time: 25,
    qs: [
      { type: 'ox', emoji: '📺', q: '유튜브가 내가 좋아할 만한 영상을 추천해 줘요.', a: true, labels: ['AI예요', 'AI 아니에요'],
        exp: '내가 본 영상들을 많이 보고 배워서, 내가 좋아할 영상을 “예측”해요. 그래서 AI예요!' },
      { type: 'ox', emoji: '📱', q: '스마트폰이 내 얼굴을 알아보고 잠금을 풀어요.', a: true, labels: ['AI예요', 'AI 아니에요'],
        exp: '얼굴 사진을 많이 보고 배운 AI가 “이 사람이 주인이다!” 하고 알아보는 거예요.' },
      { type: 'ox', emoji: '🧮', q: '계산기로 25 + 17을 계산해요.', a: false, labels: ['AI예요', 'AI 아니에요'],
        exp: '계산기는 정해진 규칙대로 계산만 해요. 많이 보고 배워서 예측하지 않으니까 AI가 아니에요.' },
      { type: 'ox', emoji: '🌏', q: '번역기가 한국어를 영어로 바꿔 줘요.', a: true, labels: ['AI예요', 'AI 아니에요'],
        exp: '수많은 문장을 보고 배워서 가장 알맞은 말을 예측해 바꿔 주는 AI예요.' },
      { type: 'ox', emoji: '🌀', q: '선풍기 버튼을 눌러 바람 세기를 바꿔요.', a: false, labels: ['AI예요', 'AI 아니에요'],
        exp: '버튼을 누르면 정해진 대로 움직일 뿐이에요. 스스로 배우지 않으니 AI가 아니에요.' },
      { type: 'ox', emoji: '🚗', q: '내비게이션이 덜 막히는 길을 찾아 줘요.', a: true, labels: ['AI예요', 'AI 아니에요'],
        exp: '많은 자동차의 길 정보를 보고 배워서 어느 길이 빠를지 예측해요. AI예요!' },
      { type: 'choice', emoji: '🤔', q: 'AI를 가장 잘 설명한 말은?', a: 1, shuffle: true,
        opts: ['사람처럼 생각하고 느끼는 로봇', '많이 보고 배워서 다음을 예측하는 컴퓨터 프로그램', '절대로 틀리지 않는 똑똑한 기계', '인터넷 속에 사는 요정'],
        exp: 'AI는 “많이 보고 배워서, 다음에 올 것을 예측하는 컴퓨터 프로그램”이에요. 생각하는 사람이 아니라 예측 기계!' },
      { type: 'choice', emoji: '🐶', q: '우리가 강아지와 고양이를 구분하게 된 것처럼, AI는 어떻게 배울까요?', a: 0, shuffle: true,
        opts: ['사진을 아주 많이 보고 패턴을 배워요', '잠을 많이 자면 저절로 알아요', '태어날 때부터 다 알고 있어요'],
        exp: '우리도 강아지·고양이를 많이 봐서 구분하게 됐죠? AI도 사진 수백만 장을 보고 패턴을 배워요.' },
      { type: 'choice', emoji: '💬', q: '“오늘 아침에 나는 ___” 챗봇은 빈칸에 무엇을 할까요?', a: 0, shuffle: true,
        opts: ['다음에 올 단어를 예측해요', '내 마음을 진짜로 읽어요', '아무 단어나 마구 넣어요'],
        exp: '챗봇은 끝말잇기처럼 “다음에 올 단어”를 계속 예측하면서 문장을 만들어요.' },
      { type: 'ox', emoji: '❗', q: 'AI도 틀릴 수 있다.', a: true, labels: ['맞아요', '아니에요'],
        exp: 'AI는 엄청 많이 배운 예측 기계예요. 예측이라서 틀릴 수도 있어요! 그래서 마지막 판단은 나!' }
    ]
  },
  {
    id: 's2', no: 2, icon: '⚖️', color: '#9b6bff', btn: 'purple',
    title: '좋은 점 vs 걱정되는 점', sub: '② AI가 우리에게 어떤 영향을?',
    desc: 'AI 덕분에 좋아지는 것과 조심해야 할 것을 나눠 보자!',
    badge: { ico: '🔭', name: '미래 생각왕' }, time: 25,
    qs: [
      { type: 'choice', emoji: '📚', q: '모르는 단어를 쉽게 설명해 줘요.', a: 0,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '어려운 말을 쉽게 풀어 주는 건 AI의 좋은 점이에요. 그래도 교과서와 한 번 더 비교해 봐요!' },
      { type: 'choice', emoji: '📝', q: '숙제를 AI에게 통째로 맡겨요.', a: 1,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '숙제를 통째로 맡기면 내 실력이 늘지 않아요. 숙제의 주인공은 바로 나!' },
      { type: 'choice', emoji: '🗣️', q: '외국어를 번역해 줘서 외국 친구와 이야기할 수 있어요.', a: 0,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '말이 달라도 친구가 될 수 있게 도와줘요. AI의 좋은 점이에요!' },
      { type: 'choice', emoji: '🖼️', q: '진짜 같은 가짜 사진과 영상이 만들어질 수 있어요.', a: 1,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '가짜 사진·영상에 속을 수 있어요. 그래서 눈으로만 믿지 말고 확인해야 해요.' },
      { type: 'choice', emoji: '🏥', q: '병원에서 의사 선생님이 병을 찾도록 도와줘요.', a: 0,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '사진을 많이 보고 배운 AI가 의사 선생님을 도와 병을 더 빨리 찾게 해 줘요.' },
      { type: 'choice', emoji: '📲', q: '추천 영상만 계속 보다가 시간이 훌쩍 지나가요.', a: 1,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: '알고리즘이 내가 좋아할 영상만 계속 보여 줘요. 스스로 멈추는 힘이 필요해요!' },
      { type: 'choice', emoji: '🦯', q: '몸이 불편한 사람에게 글을 읽어 주고 길을 알려 줘요.', a: 0,
        opts: [{ t: '👍 좋은 점', c: 'green' }, { t: '🤔 걱정되는 점', c: 'orange' }],
        exp: 'AI는 몸이 불편한 사람을 돕는 고마운 도구가 될 수 있어요.' },
      { type: 'choice', emoji: '🔪', q: 'AI는 ○○처럼 도구예요. 어떻게 쓰느냐에 따라 요리도 되고 위험할 수도 있어요. ○○에 들어갈 말은?', a: 0, shuffle: true,
        opts: ['칼', '구름', '사탕'],
        exp: '칼은 요리할 때 좋은 도구지만 잘못 쓰면 위험하죠? AI도 어떻게 쓰느냐가 중요해요!' },
      { type: 'choice', emoji: '🚀', q: '앞으로 새로운 직업을 만들어 갈 사람은 누구일까요?', a: 0, shuffle: true,
        opts: ['AI를 잘 다루고 바르게 쓰는 사람', 'AI가 무서워서 절대 안 쓰는 사람', 'AI가 시키는 대로만 하는 사람'],
        exp: 'AI를 잘 다루는 사람이 새로운 직업을 만들어요. 오늘 여러분도 그 첫발을 내디뎠어요!' }
    ]
  },
  {
    id: 's3', no: 3, icon: '🚦', color: '#3ddc84', btn: 'green',
    title: 'OK? STOP?', sub: '③ AI를 올바르게 쓰려면?',
    desc: '초록불이면 OK, 빨간불이면 STOP! 상황을 판정해 보자!',
    badge: { ico: '🛡️', name: '약속 지킴이' }, time: 25,
    qs: [
      { type: 'choice', emoji: '📖', q: '독후감을 AI가 쓴 그대로 낸다.', a: 1,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'STOP! 숙제는 내가 주인공, AI는 도우미예요. 내 생각을 내 말로 써야 해요.' },
      { type: 'choice', emoji: '🔎', q: '모르는 단어 뜻을 AI에게 물어보고 교과서와 비교한다.', a: 0,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'OK! AI 답을 그대로 믿지 않고 교과서로 한 번 더 확인했어요. 최고예요!' },
      { type: 'choice', emoji: '🏠', q: 'AI에게 우리 집 주소와 전화번호를 알려준다.', a: 1,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'STOP! 내 이름·주소·전화번호·학교는 비밀이에요. 개인정보는 꼭 지켜요.' },
      { type: 'choice', emoji: '🤪', q: '친구 얼굴 사진으로 우스꽝스러운 합성 사진을 만든다.', a: 1,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'STOP! 장난이어도 친구에게 상처가 되고 문제가 될 수 있어요. 친구 얼굴은 허락 없이 쓰지 않아요.' },
      { type: 'choice', emoji: '✏️', q: '글쓰기 아이디어를 AI에게 받고, 내 말로 다시 쓴다.', a: 0,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'OK! AI는 아이디어를 주는 도우미, 글을 완성하는 건 나예요.' },
      { type: 'choice', emoji: '🎤', q: '친구 목소리를 허락 없이 AI로 흉내 내서 영상을 만든다.', a: 1,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'STOP! 친구 얼굴뿐 아니라 목소리도 허락 없이 쓰면 안 돼요.' },
      { type: 'choice', emoji: '😨', q: 'AI가 이상하고 무서운 내용을 보여줘서 선생님께 바로 말했다.', a: 0,
        opts: [{ t: '🟢 OK', c: 'green' }, { t: '🔴 STOP', c: 'red' }],
        exp: 'OK! 이상하거나 무서운 내용이 나오면 혼자 고민하지 말고 어른께 말해요.' },
      { type: 'choice', emoji: '🤫', q: 'AI 약속 1번! 내 이름·주소·전화번호·학교는 ○○! ○○은?', a: 0, shuffle: true,
        opts: ['비밀', '자랑', '공개'],
        exp: '내 정보는 비밀! 인터넷과 AI에 함부로 알려주지 않아요.' },
      { type: 'choice', emoji: '🦸', q: '숙제는 ○○○ 주인공, AI는 도우미! ○○○은?', a: 0, shuffle: true,
        opts: ['내가', 'AI가', '엄마가'],
        exp: '숙제는 내가 주인공! AI는 옆에서 도와주는 도우미예요.' },
      { type: 'choice', emoji: '✅', q: 'AI 답은 어떻게 해야 할까요?', a: 0, shuffle: true,
        opts: ['한 번 더 확인!', '무조건 믿기!', '바로 복사해서 내기!'],
        exp: 'AI는 틀릴 수 있어요. 그래서 AI 답은 한 번 더 확인!' }
    ]
  },
  {
    id: 's4', no: 4, icon: '🔍', color: '#ffd23f', btn: 'yellow',
    title: '돋보기 탐정', sub: '④ AI가 만든 것 구분하기',
    desc: '돋보기를 들고 AI 그림의 수상한 단서를 찾아라!',
    badge: { ico: '🕵️', name: 'AI 탐정' }, time: 28,
    qs: [
      { type: 'choice', art: ART_HAND, q: '이 그림, 어디가 수상할까요?', hint: '돋보기 관찰법: 손가락·귀·안경을 살펴봐요!', a: 0, shuffle: true,
        opts: ['손가락 개수가 이상해요 (6개!)', '손 색깔이 살구색이에요', '하늘에 해가 떠 있어요'],
        exp: 'AI 그림은 손가락 개수를 자주 틀려요. 손가락·귀·안경 모양이 이상하면 AI 그림일 수 있어요!' },
      { type: 'choice', art: ART_SIGN, q: '이 가게 그림에서 수상한 단서는?', a: 0, shuffle: true,
        opts: ['간판 글자가 뭉개져서 읽을 수 없어요', '문이 갈색이에요', '창문이 하나 있어요'],
        exp: 'AI는 글자를 잘 못 그릴 때가 많아요. 간판 글자가 뭉개져 있으면 의심해 봐요!' },
      { type: 'pick', emoji: '🔍', q: 'AI가 만든 그림일 수 있는 단서를 모두 골라요!', time: 40,
        opts: ['손가락 개수가 이상해요', '글자·간판이 뭉개져 있어요', '너무 매끈하고 완벽해서 어색해요', '‘AI 생성’ 표시나 워터마크가 있어요', '하늘이 파란색이에요', '강아지가 귀엽게 웃고 있어요'],
        ans: [0, 1, 2, 3],
        exp: '돋보기 관찰법 4가지: ① 손가락·귀·안경 ② 뭉개진 글자 ③ 너무 매끈한 어색함 ④ AI 생성 표시·워터마크!' },
      { type: 'ox', emoji: '👀', q: '요즘 AI 그림은 진짜 같아서 눈으로만 구분하기 어려울 때가 많다.', a: true, labels: ['맞아요', '아니에요'],
        exp: '맞아요! 선생님도 틀릴 때가 많아요. 그래서 단서를 찾고 출처를 확인해야 해요.' },
      { type: 'ox', emoji: '🙈', q: '진짜 사진처럼 보이면 무조건 진짜다.', a: false, labels: ['맞아요', '아니에요'],
        exp: '아니에요! 눈으로만 믿지 말고, 단서를 찾고 출처를 확인해요.' },
      { type: 'choice', emoji: '🎨', q: '내가 AI로 그림을 만들어 친구에게 보여줄 때 올바른 행동은?', a: 0, shuffle: true,
        opts: ['“AI로 만들었어요”라고 솔직하게 말해요', '내가 직접 그렸다고 말해요', '아무 말도 하지 않아요'],
        exp: '내가 AI로 만든 것은 “AI로 만들었어요”라고 솔직하게 밝혀요. 그게 멋진 AI 사용자예요!' },
      { type: 'choice', emoji: '🏷️', q: '사진 구석에 ‘AI 생성’이라는 표시가 있어요. 이건 무슨 뜻일까요?', a: 0, shuffle: true,
        opts: ['AI가 만든 사진이라는 뜻이에요', '아주 비싼 사진이라는 뜻이에요', '상을 받은 사진이라는 뜻이에요'],
        exp: '‘AI 생성’, ‘AI로 만든 콘텐츠’ 표시나 워터마크는 AI가 만들었다는 중요한 단서예요.' }
    ]
  },
  {
    id: 's5', no: 5, icon: '📰', color: '#ff4d8d', btn: 'pink',
    title: '팩트체크 뉴스룸', sub: '⑤ 유튜브·SNS는 다 진짜일까?',
    desc: '수상한 뉴스를 판정하고 팩트체크 3단계를 완성하라!',
    badge: { ico: '✅', name: '팩트체커' }, time: 28,
    qs: [
      { type: 'choice', q: '이 뉴스, 어떻게 판정할까요?', a: 1,
        news: { title: '“내일부터 전국 초등학교 숙제 없어진다!!!”', meta: '출처: 없음 · 날짜: 없음' },
        opts: [{ t: '✅ 진짜 같아요', c: 'green' }, { t: '❌ 가짜 같아요', c: 'red' }, { t: '⚠️ 사기 주의', c: 'orange' }],
        exp: '출처도 날짜도 없고, 느낌표가 3개나! 가짜일 가능성이 커요. 누가? 언제? 를 확인해요.' },
      { type: 'choice', q: '이 뉴스, 어떻게 판정할까요?', a: 0,
        news: { title: '“우리 동네 도서관 다음 주 휴관”', meta: '출처: 구청 홈페이지 공지 · 날짜: 11월 20일' },
        opts: [{ t: '✅ 진짜 같아요', c: 'green' }, { t: '❌ 가짜 같아요', c: 'red' }, { t: '⚠️ 사기 주의', c: 'orange' }],
        exp: '믿을 만한 곳(구청 홈페이지)에서, 날짜까지 있어요. 진짜일 가능성이 커요!' },
      { type: 'choice', q: '이 글, 어떻게 판정할까요?', a: 2,
        news: { title: '“유명 연예인이 이 게임 추천! 링크 클릭하면 아이템 무료!”', meta: '출처: 모르는 계정 · 링크 클릭 유도' },
        opts: [{ t: '✅ 진짜 같아요', c: 'green' }, { t: '❌ 가짜 같아요', c: 'red' }, { t: '⚠️ 사기 주의', c: 'orange' }],
        exp: '“무료”, “링크 클릭”은 사기의 단골 문장이에요. 절대 누르지 말고 어른께 알려요!' },
      { type: 'choice', q: '이 글, 어떻게 판정할까요?', a: 1,
        news: { title: '“충격! 바나나 먹으면 하루 만에 키 10cm!!! 지금 바로 공유하세요”', meta: '출처: 없음 · 조회수 100만' },
        opts: [{ t: '✅ 진짜 같아요', c: 'green' }, { t: '❌ 가짜 같아요', c: 'red' }, { t: '⚠️ 사기 주의', c: 'orange' }],
        exp: '너무 신기한 소식일수록 멈추고 확인! 조회수가 많다고 진짜는 아니에요.' },
      { type: 'order', emoji: '✋', q: '팩트체크 3단계! 순서대로 눌러 보세요.', time: 30,
        items: ['☝️ 누가?', '✌️ 언제?', '🤟 다른 곳에도?'],
        exp: '누가? → 언제? → 다른 곳에도? 손가락 세 개를 펼치며 외쳐 봐요!' },
      { type: 'choice', emoji: '☝️', q: '팩트체크 1단계 “누가?”에서는 무엇을 확인할까요?', a: 0, shuffle: true,
        opts: ['누가 만들었나? 믿을 만한 곳인가?', '글자 색깔이 예쁜가?', '댓글이 많이 달렸나?'],
        exp: '“누가?” = 누가 만들었는지, 믿을 만한 곳인지 확인하는 단계예요.' },
      { type: 'choice', emoji: '🤟', q: '팩트체크 3단계 “다른 곳에도?”에서는 무엇을 확인할까요?', a: 0, shuffle: true,
        opts: ['뉴스나 공식 홈페이지에도 나오는지', '친구가 좋아요를 눌렀는지', '영상이 재미있는지'],
        exp: '“다른 곳에도?” = 뉴스·공식 홈페이지 같은 다른 곳에도 같은 소식이 있는지 확인해요.' },
      { type: 'ox', emoji: '👁️', q: '조회수가 100만이면 진짜 뉴스다.', a: false, labels: ['맞아요', '아니에요'],
        exp: '아니에요! 가짜 뉴스도 조회수가 많을 수 있어요. 조회수가 아니라 출처를 확인해요.' },
      { type: 'choice', emoji: '😡', q: '너무 화나거나 너무 신기한 소식을 봤어요. 어떻게 할까요?', a: 0, shuffle: true,
        opts: ['멈추고 확인한 다음에 공유해요', '바로 단톡방에 공유해요', '댓글로 화를 내요'],
        exp: '공유 버튼은 확인한 다음에! 너무 화나거나 신기한 소식일수록 멈추고 확인해요.' }
    ]
  }
];

/* 보스전 추가 문제 (AI 약속) */
const BOSS_EXTRA = [
  { type: 'choice', emoji: '🙅', q: 'AI 약속 4번! 친구 얼굴·목소리는 ○○ ○○ 쓰지 않기!', a: 0, shuffle: true,
    opts: ['허락 없이', '아침마다', '크게 크게'],
    exp: '친구 얼굴·목소리는 허락 없이 쓰지 않아요. 친구의 마음도 소중하니까요!' },
  { type: 'choice', emoji: '🧑‍🏫', q: 'AI 약속 5번! 이상하거나 무서운 내용이 나오면?', a: 0, shuffle: true,
    opts: ['어른께 말하기!', '혼자 계속 보기!', '친구에게 몰래 보내기!'],
    exp: '이상하거나 무서운 내용이 나오면 부모님이나 선생님께 바로 말해요.' },
  { type: 'choice', emoji: '🏁', q: '오늘 1부의 한 줄 메시지! “AI는 똑똑한 예측 기계, 마지막 판단은 ○!”', a: 0, shuffle: true,
    opts: ['나', 'AI', '유튜브'],
    exp: 'AI는 똑똑한 예측 기계, 마지막 판단은 나! 판단과 책임은 나에게 있어요.' }
];

const BOSS = {
  id: 'boss', no: 6, icon: '👾', color: '#ff9f3d', btn: 'orange', boss: true,
  title: '최종 보스: 스피드 퀴즈', sub: '1부 전체 복습 · 12문제 랜덤!',
  desc: '모든 스테이지에서 랜덤으로 나오는 스피드 퀴즈! 시간은 짧고 점수는 크다!',
  badge: { ico: '🏆', name: 'AI리터러시 챔피언' }, time: 20
};
const ALL_STAGES = [...STAGES, BOSS];

/* ---------- 저장 (이 기기에만 저장) ---------- */
const STORE_KEY = 'yussam-ai-arena-v1';
let save = { nick: '', best: {}, promises: [] };
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s) save = Object.assign(save, s); } catch (e) { /* 저장 불가 환경 */ }
}
function writeSave() { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (e) { /* 무시 */ } }

/* ---------- 효과음 (Web Audio API로 직접 합성, 파일 필요 없음) ---------- */
const Sound = (() => {
  let ctx = null; let muted = false;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, d, type = 'square', v = 0.1, delay = 0, f2 = null) {
    if (muted) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + d + 0.03);
  }
  function noise(d = 0.2, v = 0.12, delay = 0, freq = 1200) {
    if (muted) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = v;
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
  }
  return {
    unlock() { ac(); },
    toggle() { muted = !muted; return muted; },
    get muted() { return muted; },
    click() { tone(760, 0.05, 'square', 0.06); tone(1140, 0.05, 'square', 0.04, 0.03); },
    correct() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.08, i * 0.07)); tone(2093, 0.3, 'triangle', 0.06, 0.28); },
    wrong() { tone(330, 0.3, 'sawtooth', 0.09, 0, 140); tone(250, 0.4, 'sawtooth', 0.08, 0.15, 90); noise(0.15, 0.06, 0, 400); },
    tick() { tone(1250, 0.05, 'sine', 0.12); },
    timeout() { tone(600, 0.15, 'square', 0.08); tone(400, 0.15, 'square', 0.08, 0.16); tone(250, 0.4, 'square', 0.08, 0.32); },
    count() { tone(440, 0.18, 'square', 0.09); },
    go() { tone(880, 0.12, 'square', 0.09); tone(1320, 0.35, 'square', 0.08, 0.1); noise(0.3, 0.05, 0, 3000); },
    combo() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.09, 'triangle', 0.1, i * 0.045)); },
    star() { tone(1200, 0.25, 'triangle', 0.12, 0, 2200); tone(2400, 0.2, 'sine', 0.05, 0.05); },
    stamp() { noise(0.12, 0.25, 0, 300); tone(120, 0.15, 'sine', 0.25); },
    select() { tone(660, 0.08, 'triangle', 0.1, 0, 990); },
    fanfare() {
      const n = [[523, 0, .12], [523, .13, .12], [523, .26, .12], [659, .39, .45], [587, .86, .2], [659, 1.06, .2], [784, 1.26, .7]];
      n.forEach(([f, d, l]) => { tone(f, l, 'square', 0.08, d); tone(f / 2, l, 'triangle', 0.08, d); });
    },
    start() { tone(220, 0.35, 'sawtooth', 0.06, 0, 880); noise(0.35, 0.05, 0, 2000); },
    whoosh() { noise(0.35, 0.12, 0, 1800); tone(300, 0.3, 'sine', 0.05, 0, 900); },
    perfect() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.12, 'triangle', 0.09, 0.05 + i * 0.05)); },
    fever() { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.1, 'square', 0.07, i * 0.06)); noise(0.5, 0.06, 0, 4000); },
    bossHit() { noise(0.2, 0.3, 0, 600); tone(180, 0.2, 'square', 0.12, 0, 60); },
    bossAttack() { tone(90, 0.5, 'sawtooth', 0.12, 0, 40); noise(0.4, 0.2, 0.05, 250); },
    bossDie() { [880, 784, 659, 523, 392, 262].forEach((f, i) => tone(f, 0.12, 'square', 0.08, i * 0.08)); noise(0.8, 0.25, 0.4, 500); },
    sparkle() { tone(1800 + Math.random() * 800, 0.08, 'sine', 0.04); },
    pause() { tone(660, 0.12, 'square', 0.08); tone(440, 0.2, 'square', 0.08, 0.12); },
    play: tone,
    hat: noise,
    now() { const c = ac(); return c ? c.currentTime : 0; }
  };
})();

/* ---------- 배경음악 (8비트 칩튠, 직접 합성) ---------- */
const Music = (() => {
  let timer = null, step = 0, nextAt = 0, tempo = 136, playing = false;
  // 코드 진행: Am - F - C - G
  const bass = [110, 110, 87.31, 87.31, 130.81, 130.81, 98, 98];
  const arps = [
    [440, 523, 659, 523], [349, 440, 523, 440], [392, 523, 659, 523], [392, 494, 587, 494]
  ];
  const melody = [659, 0, 784, 659, 587, 0, 523, 0, 523, 0, 587, 659, 784, 0, 659, 0];
  function tick() {
    const now = Sound.now();
    while (nextAt < now + 0.15) {
      const d = nextAt - now;
      const bar = Math.floor(step / 8) % 4;
      const s8 = step % 8;
      if (s8 % 2 === 0) Sound.play(bass[bar * 2 + (s8 >= 4 ? 1 : 0)], 0.22, 'triangle', 0.07, Math.max(0, d));
      Sound.play(arps[bar][s8 % 4] * 2, 0.08, 'square', 0.018, Math.max(0, d));
      const m = melody[step % 16];
      if (m && step % 64 >= 32) Sound.play(m, 0.16, 'square', 0.025, Math.max(0, d));
      if (s8 % 2 === 1) Sound.hat(0.04, 0.03, Math.max(0, d), 7000);
      nextAt += 60 / tempo / 2;
      step++;
    }
  }
  return {
    start() { if (playing) return; playing = true; step = 0; nextAt = Sound.now() + 0.1; timer = setInterval(tick, 40); },
    stop() { playing = false; clearInterval(timer); timer = null; },
    fever(on) { tempo = on ? 176 : 136; }
  };
})();

/* ---------- 유틸 ---------- */
const $ = (s, el = document) => el.querySelector(s);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const optText = (o) => (typeof o === 'string' ? o : o.t);
const COLORS = ['blue', 'pink', 'orange', 'purple'];

/* ---------- 메인 화면 렌더링 ---------- */
function starsHTML(n) {
  return [0, 1, 2].map(i => `<span class="${i < n ? '' : 'off'}">⭐</span>`).join('');
}
function renderStages() {
  $('#stageGrid').innerHTML = ALL_STAGES.map(s => {
    const b = save.best[s.id] || { stars: 0, score: 0 };
    const count = s.boss ? 12 : s.qs.length;
    return `
      <article class="stage-card ${s.boss ? 'stage-card--boss' : ''}" style="--c:${s.color}; --d:color-mix(in srgb, ${s.color} 60%, #000)">
        <div class="stage-card__top">
          <span class="stage-card__no">${s.boss ? 'BOSS' : 'STAGE ' + s.no}</span>
          <span class="stage-card__stars">${starsHTML(b.stars)}</span>
        </div>
        <div class="stage-card__ico">${s.icon}</div>
        <div>
          <h3>${s.title}</h3>
          <p class="stage-card__sub">${s.sub}</p>
          <p class="stage-card__desc">${s.desc}</p>
          <p class="stage-card__best">📝 ${count}문제 · 🏅 ${b.score ? '최고 ' + b.score + '점' : '아직 도전 전'}</p>
        </div>
        <button class="btn3d btn3d--${s.btn}" data-stage="${s.id}">${s.boss ? '보스 도전! ⚔️' : '도전하기 ▶'}</button>
      </article>`;
  }).join('');
}
function renderBadges() {
  $('#badgeGrid').innerHTML = ALL_STAGES.map(s => {
    const earned = (save.best[s.id] || {}).stars >= 2;
    return `<div class="badge ${earned ? 'earned' : ''}">
      <div class="badge__ico">${s.badge.ico}</div>
      <div class="badge__name">${s.badge.name}</div>
      <div class="badge__how">${earned ? '획득 완료! 🎉' : (s.boss ? '보스전' : 'STAGE ' + s.no) + ' 별 2개'}</div>
    </div>`;
  }).join('');
}
function renderHUD() {
  let total = 0, stars = 0;
  ALL_STAGES.forEach(s => { const b = save.best[s.id]; if (b) { total += b.score; stars += b.stars; } });
  $('#hudTotal').textContent = total.toLocaleString();
  $('#hudStars').textContent = stars;
}
function renderPromises() {
  document.querySelectorAll('.promise').forEach(btn => {
    btn.classList.toggle('stamped', save.promises.includes(Number(btn.dataset.i)));
  });
}
function renderAll() { renderStages(); renderBadges(); renderHUD(); renderPromises(); }

/* ---------- 게임 상태 ---------- */
const G = { stage: null, qs: [], i: 0, score: 0, combo: 0, maxCombo: 0, correct: 0, log: [], timer: null, locked: false, timeLeft: 0, timeMax: 0, lastTick: 0 };

const arena = $('#arena');
const view = $('#stageView');

async function openStage(id) {
  const stage = ALL_STAGES.find(s => s.id === id);
  if (!stage) return;
  G.stage = stage;
  G.qs = stage.boss ? buildBoss() : stage.qs.slice();
  Object.assign(G, { i: 0, score: 0, combo: 0, maxCombo: 0, correct: 0, log: [], locked: true, fever: false, paused: false });
  G.bossHp = G.qs.length;

  arena.style.setProperty('--stage-c', stage.color);
  $('#arenaStage').innerHTML = `${stage.boss ? 'BOSS' : 'STAGE ' + stage.no} · ${stage.title}<span class="fever-tag">FEVER x2</span>`;
  arena.classList.remove('result-mode', 'fever');
  arena.classList.add('open'); arena.setAttribute('aria-hidden', 'false');
  arena.scrollTop = 0;
  document.body.classList.add('no-scroll');
  view.innerHTML = '';
  // 보스 패널
  const bp = $('#bossPanel');
  bp.hidden = !stage.boss;
  $('#bossMonster').className = 'boss__monster';
  updateBoss();
  updateHud();
  Music.fever(false);
  say(stage.boss ? '보스가 나타났다! 정답으로 공격해! ⚔️' : `${save.nick || '탐정'}님, 준비됐나요? 가 보자고! 🚀`);
  Sound.start();
  await countdown();
  if (!G.paused) Music.start();
  showQuestion();
}

/* ---------- 마스코트 ---------- */
const LINES = {
  start: ['할 수 있어! 천천히 읽어 봐요 📖', '문제를 끝까지 읽는 사람이 진짜 탐정! 🔍', '집중! 집중! 🎯', '이번 문제도 맞혀 볼까? 😎', '오늘 배운 거 생각나죠? 💡'],
  good: ['우와! 천재 탐정이다! 🤩', '정답! 박수 짝짝짝 👏', '역시 오늘 수업 잘 들었구나! 🌟', '최고야! 이 기세로 계속! 🚀', '완벽해! 선생님도 깜짝! 😲'],
  bad: ['괜찮아! 해설 보면 바로 알게 돼요 💪', '틀려도 괜찮아, 배우는 중이야! 🌱', '아까워~ 다음엔 꼭 맞힐 거야! 🍀', '해설을 읽으면 진짜 실력이 쑥쑥! 📚'],
  hurry: ['서둘러요! 시간이 얼마 안 남았어! ⏰', '3초! 2초! 빨리빨리! 🏃'],
  fever: ['피버 타임!! 점수 2배다!! 🔥🔥', '불타오른다~! 계속 맞혀! 🔥'],
  boss: ['보스에게 큰 타격! 💥', '보스가 비틀거려요! 계속 공격! ⚔️'],
  bossHit: ['으악! 보스의 반격! 다음엔 막아 보자! 🛡️']
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function say(text, mood = '') {
  const m = $('#mascot'); const b = $('#mascotSay');
  b.textContent = text;
  b.classList.remove('talk'); void b.offsetWidth; b.classList.add('talk');
  m.classList.remove('happy', 'sad'); void m.offsetWidth;
  if (mood) m.classList.add(mood);
  $('#mascotBody').textContent = mood === 'happy' ? '🤩' : mood === 'sad' ? '😵' : (G.fever ? '😎' : '🤖');
}
function updateBoss() {
  const total = G.qs.length || 1;
  $('#bossHp').style.width = `${(G.bossHp / total) * 100}%`;
  $('#bossHpText').textContent = `HP ${G.bossHp}/${total}`;
}
function bossReact(hit) {
  const mon = $('#bossMonster');
  mon.classList.remove('hit', 'attack'); void mon.offsetWidth;
  if (hit) {
    G.bossHp = Math.max(0, G.bossHp - 1); updateBoss();
    mon.classList.add(G.bossHp === 0 ? 'dead' : 'hit');
    G.bossHp === 0 ? Sound.bossDie() : Sound.bossHit();
    const r = mon.getBoundingClientRect();
    popAt('-1 💥', r.left + r.width / 2, r.top);
  } else {
    mon.classList.add('attack'); Sound.bossAttack();
  }
}

/* ---------- 라운드 배너 ---------- */
async function roundBanner(text) {
  const rb = $('#roundBanner'); const t = $('#roundText');
  t.textContent = text; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
  rb.classList.add('show'); Sound.whoosh();
  await sleep(900);
  rb.classList.remove('show');
}

/* ---------- 판정 글자 ---------- */
function judge(kind) {
  const el = document.createElement('div');
  el.className = 'judge ' + kind;
  el.textContent = { perfect: 'PERFECT!', great: 'GREAT!', good: 'GOOD!', miss: 'MISS...' }[kind];
  $('#fxLayer').appendChild(el);
  setTimeout(() => el.remove(), 1050);
}

function buildBoss() {
  const pool = [];
  STAGES.forEach(s => s.qs.forEach(q => pool.push(q)));
  BOSS_EXTRA.forEach(q => pool.push(q));
  const picked = shuffle(pool).slice(0, 12);
  return picked;
}

async function countdown() {
  const cd = $('#countdown'); const num = $('#countNum');
  cd.classList.add('open');
  for (const n of ['3', '2', '1']) {
    num.textContent = n; num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    Sound.count(); await sleep(700);
  }
  num.textContent = 'GO!'; num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
  Sound.go(); await sleep(650);
  cd.classList.remove('open');
}

function closeArena() {
  stopTimer();
  Music.stop();
  G.locked = true; G.paused = false;
  $('#pause').classList.remove('open');
  arena.classList.remove('fever');
  arena.classList.remove('open'); arena.setAttribute('aria-hidden', 'true');
  $('#feedback').classList.remove('open');
  document.body.classList.remove('no-scroll');
  renderAll();
}

function updateHud() {
  $('#arenaScore').textContent = G.score.toLocaleString();
  const c = $('#arenaCombo');
  c.innerHTML = `🔥 x<b>${G.combo}</b>`;
  c.classList.toggle('hot', G.combo >= 3);
  $('#progressFill').style.width = `${(G.i / G.qs.length) * 100}%`;
  $('#qCount').textContent = `문제 ${Math.min(G.i + 1, G.qs.length)} / ${G.qs.length}`;
}

/* ---------- 문제 화면 ---------- */
async function showQuestion() {
  const q = G.qs[G.i];
  G.locked = true;
  updateHud();
  view.innerHTML = '';
  $('#timerFill').style.transform = 'scaleX(1)';
  $('#timerNum').textContent = q.time || G.stage.time;
  $('.timer').classList.remove('danger');
  const last = G.i === G.qs.length - 1;
  await roundBanner(last ? 'FINAL ROUND!' : `ROUND ${G.i + 1}`);
  while (G.paused) await sleep(200);
  if (!arena.classList.contains('open')) return;
  say(pick(G.fever ? LINES.fever : LINES.start));
  G.locked = false;

  const top = q.art ? `<div class="qcard__art">${q.art}</div>`
            : q.news ? '' : `<div class="qcard__emoji">${q.emoji || '❓'}</div>`;
  const news = q.news ? `<div class="news"><div class="news__head"><span>📰 오늘의 소식</span><em>수업용 가상 자료</em></div>
      <div class="news__title">${q.news.title}</div><div class="news__meta">${q.news.meta}</div></div>` : '';
  const tag = { ox: 'O / X 퀴즈', choice: q.news ? '뉴스 판정' : '퀴즈', pick: '모두 고르기', order: '순서대로 누르기' }[q.type];

  view.innerHTML = `
    <div class="qcard">
      <span class="qcard__tag">Q${G.i + 1} · ${tag}</span>
      ${top}
      <div class="qcard__q">${q.q}</div>
      ${q.hint ? `<p class="qcard__hint">💡 ${q.hint}</p>` : ''}
      ${news}
    </div>
    <div class="answers-wrap"></div>`;

  const wrap = view.querySelector('.answers-wrap');
  if (q.type === 'ox') renderOX(q, wrap);
  else if (q.type === 'choice') renderChoice(q, wrap);
  else if (q.type === 'pick') renderPick(q, wrap);
  else if (q.type === 'order') renderOrder(q, wrap);

  startTimer(q.time || G.stage.time);
}

function renderOX(q, wrap) {
  const [lo, lx] = q.labels || ['맞아요', '아니에요'];
  wrap.innerHTML = `<div class="answers answers--2">
    <button class="btn3d btn3d--blue btn-ox" data-v="1"><span class="ox-big">O</span><span class="ox-label">${lo}</span></button>
    <button class="btn3d btn3d--red btn-ox" data-v="0"><span class="ox-big">X</span><span class="ox-label">${lx}</span></button>
  </div>`;
  wrap.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    if (G.locked) return;
    const ok = (btn.dataset.v === '1') === q.a;
    const right = wrap.querySelector(`[data-v="${q.a ? 1 : 0}"]`);
    markButtons(wrap, btn, right, ok);
    finish(ok, `${q.a ? 'O' : 'X'} · ${q.a ? lo : lx}`, btn);
  }));
}

function renderChoice(q, wrap) {
  let items = q.opts.map((o, idx) => ({ o, idx }));
  if (q.shuffle) items = shuffle(items);
  const styled = typeof q.opts[0] !== 'string';
  const cls = styled ? (q.opts.length === 2 ? 'answers--2' : 'answers--3') : 'answers--list';
  wrap.innerHTML = `<div class="answers ${cls}">${items.map((it, n) => {
    const color = styled ? it.o.c : COLORS[n % COLORS.length];
    const key = styled ? '' : `<span class="opt-key">${n + 1}</span>`;
    return `<button class="btn3d btn3d--${color}" data-idx="${it.idx}">${key}<span>${optText(it.o)}</span></button>`;
  }).join('')}</div>`;
  wrap.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    if (G.locked) return;
    const ok = Number(btn.dataset.idx) === q.a;
    const right = wrap.querySelector(`[data-idx="${q.a}"]`);
    markButtons(wrap, btn, right, ok);
    finish(ok, optText(q.opts[q.a]), btn);
  }));
}

function renderPick(q, wrap) {
  const items = shuffle(q.opts.map((o, idx) => ({ o, idx })));
  const sel = new Set();
  wrap.innerHTML = `<div class="answers answers--list answers--grid2">${items.map((it, n) =>
    `<button class="btn3d btn3d--${COLORS[n % COLORS.length]}" data-idx="${it.idx}"><span>${optText(it.o)}</span></button>`).join('')}</div>
    <div class="submit-row"><button class="btn3d btn3d--yellow" id="pickSubmit">정답 확인! ✔</button></div>`;
  wrap.querySelectorAll('[data-idx]').forEach(btn => btn.addEventListener('click', () => {
    if (G.locked) return;
    const i = Number(btn.dataset.idx);
    if (sel.has(i)) sel.delete(i); else sel.add(i);
    btn.classList.toggle('selected', sel.has(i));
    Sound.select();
  }));
  $('#pickSubmit').addEventListener('click', () => {
    if (G.locked) return;
    const ans = new Set(q.ans);
    const ok = sel.size === ans.size && [...sel].every(i => ans.has(i));
    wrap.querySelectorAll('[data-idx]').forEach(btn => {
      const i = Number(btn.dataset.idx);
      btn.classList.remove('selected');
      if (ans.has(i)) btn.classList.add('correct');
      else if (sel.has(i)) btn.classList.add('wrong');
      else btn.classList.add('dim');
    });
    finish(ok, q.ans.map(i => optText(q.opts[i])).join(' / '), $('#pickSubmit'));
  });
}

function renderOrder(q, wrap) {
  const items = shuffle(q.items.map((t, idx) => ({ t, idx })));
  let next = 0;
  wrap.innerHTML = `<div class="answers answers--3">${items.map((it, n) =>
    `<button class="btn3d btn3d--${COLORS[n % COLORS.length]}" data-idx="${it.idx}"><span>${it.t}</span></button>`).join('')}</div>`;
  wrap.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    if (G.locked || btn.classList.contains('correct')) return;
    const i = Number(btn.dataset.idx);
    if (i === next) {
      btn.classList.add('correct');
      btn.insertAdjacentHTML('beforeend', `<span class="order-no">${next + 1}</span>`);
      Sound.select();
      next++;
      if (next === q.items.length) finish(true, q.items.join(' → '), btn);
    } else {
      btn.classList.add('wrong');
      finish(false, q.items.join(' → '), btn);
    }
  }));
}

function markButtons(wrap, chosen, right, ok) {
  wrap.querySelectorAll('button').forEach(b => { if (b !== chosen && b !== right) b.classList.add('dim'); });
  if (ok) chosen.classList.add('correct');
  else { chosen.classList.add('wrong'); if (right) right.classList.add('correct'); }
}

/* ---------- 타이머 ---------- */
function startTimer(sec) {
  stopTimer();
  G.timeMax = sec * 1000; G.timeLeft = G.timeMax; G.lastTick = sec + 1;
  $('#timerFill').parentElement.classList.remove('danger');
  $('#timerFill').style.transform = 'scaleX(1)'; $('#timerNum').textContent = sec;
  runTimer();
}
function runTimer() {
  const fill = $('#timerFill'); const num = $('#timerNum'); const box = fill.parentElement;
  let last = null;
  const loop = (now) => {
    if (last === null) last = now;
    G.timeLeft -= (now - last); last = now;
    const ratio = Math.max(0, G.timeLeft / G.timeMax);
    fill.style.transform = `scaleX(${ratio})`;
    const s = Math.ceil(G.timeLeft / 1000);
    num.textContent = Math.max(0, s);
    if (s <= 5 && s > 0 && s < G.lastTick) {
      Sound.tick(); box.classList.add('danger');
      if (s === 5) say(pick(LINES.hurry));
    }
    G.lastTick = s;
    if (G.timeLeft <= 0) { G.timer = null; onTimeout(); return; }
    G.timer = requestAnimationFrame(loop);
  };
  G.timer = requestAnimationFrame(loop);
}
function pauseGame() {
  if (!arena.classList.contains('open') || arena.classList.contains('result-mode') || G.paused) return;
  G.paused = true;
  const wasRunning = !!G.timer;
  stopTimer();
  G.resumeTimer = wasRunning;
  Music.stop(); Sound.pause();
  $('#pause').classList.add('open');
  setTimeout(() => $('#resumeBtn').focus({ preventScroll: true }), 50);
}
function resumeGame() {
  if (!G.paused) return;
  G.paused = false;
  $('#pause').classList.remove('open');
  Music.start();
  if (G.resumeTimer && !G.locked) runTimer();
  say('좋아요! 다시 집중! 🎯');
}
function stopTimer() { if (G.timer) cancelAnimationFrame(G.timer); G.timer = null; }

function onTimeout() {
  if (G.locked) return;
  const q = G.qs[G.i];
  const wrap = view.querySelector('.answers-wrap');
  let answer = '';
  if (q.type === 'ox') { answer = `${q.a ? 'O' : 'X'}`; wrap.querySelector(`[data-v="${q.a ? 1 : 0}"]`)?.classList.add('correct'); }
  else if (q.type === 'choice') { answer = optText(q.opts[q.a]); wrap.querySelector(`[data-idx="${q.a}"]`)?.classList.add('correct'); }
  else if (q.type === 'pick') { answer = q.ans.map(i => optText(q.opts[i])).join(' / '); q.ans.forEach(i => wrap.querySelector(`[data-idx="${i}"]`)?.classList.add('correct')); }
  else if (q.type === 'order') { answer = q.items.join(' → '); }
  wrap.querySelectorAll('button').forEach(b => { if (!b.classList.contains('correct')) b.classList.add('dim'); });
  finish(false, answer, null, true);
}

/* ---------- 정답 처리 ---------- */
function finish(ok, answerText, srcEl, timeout = false) {
  if (G.locked) return;
  G.locked = true;
  stopTimer();
  const q = G.qs[G.i];
  let gained = 0;

  if (ok) {
    G.combo++; G.correct++;
    G.maxCombo = Math.max(G.maxCombo, G.combo);
    const tr = G.timeLeft / G.timeMax;
    const kind = tr > 0.6 ? 'perfect' : tr > 0.3 ? 'great' : 'good';
    const speed = Math.round(tr * 50);
    gained = 100 + speed + Math.min(G.combo - 1, 5) * 20;
    if (G.stage.boss) gained = Math.round(gained * 1.5);
    if (G.fever) gained *= 2;
    G.score += gained;
    Sound.correct();
    if (kind === 'perfect') Sound.perfect();
    judge(kind);
    flash('good');
    popText(`+${gained}`, srcEl);
    burstConfetti(kind === 'perfect' ? 70 : 40, srcEl);
    say(pick(G.stage.boss ? LINES.boss : LINES.good), 'happy');
    if (G.stage.boss) setTimeout(() => bossReact(true), 300);
    // 피버 타임 진입 (5연속 정답)
    if (G.combo >= 5 && !G.fever) {
      G.fever = true; arena.classList.add('fever'); Music.fever(true);
      setTimeout(() => { Sound.fever(); popText('🔥 FEVER TIME! 점수 2배! 🔥', null, true); say(pick(LINES.fever), 'happy'); burstConfetti(120); }, 500);
    } else if (G.combo >= 3) {
      setTimeout(() => { Sound.combo(); popText(`🔥 ${G.combo} COMBO!`, null, true); }, 300);
    }
  } else {
    if (G.fever) { G.fever = false; arena.classList.remove('fever'); Music.fever(false); }
    G.combo = 0;
    timeout ? Sound.timeout() : Sound.wrong();
    judge('miss');
    flash('bad');
    say(G.stage.boss ? pick(LINES.bossHit) : pick(LINES.bad), 'sad');
    if (G.stage.boss) setTimeout(() => bossReact(false), 200);
    $('.arena__inner').classList.remove('shake-screen'); void $('.arena__inner').offsetWidth;
    $('.arena__inner').classList.add('shake-screen');
  }
  G.log.push({ q: q.q, ok });
  updateHud();

  setTimeout(() => showFeedback(ok, answerText, q.exp, timeout), ok ? 1100 : 1100);
}

function showFeedback(ok, answerText, exp, timeout) {
  const fb = $('#feedback'); const box = $('#feedbackBox');
  const goodTitles = ['정답이에요!', '딩동댕!', '역시 AI 탐정!', '완벽해요!', '대단해요!'];
  const goodEmoji = ['🎉', '🥳', '🌟', '👏', '💯'];
  const r = Math.floor(Math.random() * goodTitles.length);
  box.classList.toggle('is-wrong', !ok);
  $('#fbEmoji').textContent = ok ? goodEmoji[r] : (timeout ? '⏰' : '😅');
  $('#fbTitle').textContent = ok ? goodTitles[r] : (timeout ? '시간 초과!' : '아쉬워요!');
  $('#fbAnswer').textContent = ok ? '' : `정답: ${answerText}`;
  $('#fbExp').textContent = exp || '';
  const last = G.i >= G.qs.length - 1;
  $('#nextBtn').textContent = last ? '결과 보기 🏆' : '다음 문제 ▶';
  fb.classList.add('open');
  setTimeout(() => $('#nextBtn').focus({ preventScroll: true }), 50);
}

function nextQuestion() {
  $('#feedback').classList.remove('open');
  G.i++;
  if (G.i >= G.qs.length) { showResult(); return; }
  arena.scrollTo({ top: 0, behavior: 'smooth' });
  showQuestion();
}

/* ---------- 결과 화면 ---------- */
async function showResult() {
  stopTimer();
  Music.stop();
  arena.classList.remove('fever');
  arena.classList.add('result-mode');
  $('#progressFill').style.width = '100%';
  const total = G.qs.length;
  const ratio = G.correct / total;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;
  const s = G.stage;

  const prev = save.best[s.id] || { stars: 0, score: 0 };
  const newRecord = G.score > prev.score;
  save.best[s.id] = { stars: Math.max(prev.stars, stars), score: Math.max(prev.score, G.score) };
  writeSave();

  const earned = stars >= 2;
  const nick = save.nick || '꼬마 탐정';
  const idx = ALL_STAGES.indexOf(s);
  const nextStage = ALL_STAGES[idx + 1];
  const grade = (G.correct === total) ? 'S' : stars === 3 ? 'A' : stars === 2 ? 'B' : 'C';
  const gradeName = { S: '전설', A: '최고', B: '훌륭', C: '도전' }[grade];
  const bossMsg = s.boss ? (G.bossHp === 0 ? '💥 가짜뉴스 대마왕 격파! 💥' : `대마왕 HP ${G.bossHp} 남음! 다시 도전해서 물리치자!`) : '';
  const msg = stars === 3 ? '완벽해요! 오늘 배운 내용을 정말 잘 기억하고 있어요! 🙌'
            : stars === 2 ? '잘했어요! 틀린 문제 해설을 한 번 더 읽어 보면 별 3개도 문제없어요!'
            : '괜찮아요! 틀리면서 배우는 거예요. 다시 도전하면 더 잘할 수 있어요! 💪';

  view.innerHTML = `
    <div class="result">
      <div class="grade-stamp ${grade}">${grade}<small>${gradeName}</small></div>
      <div class="result__trophy">${stars === 3 ? '🏆' : stars === 2 ? '🥈' : '🎖️'}</div>
      <div class="result__title">STAGE CLEAR!</div>
      ${bossMsg ? `<div class="result__bossmsg">${bossMsg}</div>` : ''}
      <div class="result__player">플레이어 「${escapeHTML(nick)}」</div>
      <div class="result__stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
      <div class="result__nums">
        <div><small>점수${newRecord ? ' 🆕 신기록!' : ''}</small><strong id="countScore">0</strong></div>
        <div><small>맞힌 문제</small><strong>${G.correct} / ${total}</strong></div>
        <div><small>최대 콤보</small><strong>🔥 ${G.maxCombo}</strong></div>
      </div>
      ${earned
        ? `<div class="result__badge"><span>${s.badge.ico}</span>배지 획득! 「${s.badge.name}」</div>`
        : `<div class="result__badge miss"><span>🔒</span>별 2개를 모으면 「${s.badge.name}」 배지!</div>`}
      <p class="result__msg">${msg}</p>
      <details class="review">
        <summary>📋 내 답 다시 보기</summary>
        <ul>${G.log.map((l, i) => `<li class="${l.ok ? '' : 'x'}"><em>${l.ok ? '⭕' : '❌'} Q${i + 1}</em> ${l.q}</li>`).join('')}</ul>
      </details>
      <div class="result__btns">
        <button class="btn3d btn3d--yellow" data-act="retry">다시 도전 🔁</button>
        ${nextStage ? `<button class="btn3d btn3d--${nextStage.btn}" data-act="next">${nextStage.boss ? '보스전 도전 ⚔️' : '다음 스테이지 ▶'}</button>` : ''}
        <button class="btn3d btn3d--ghost" data-act="map">스테이지 맵 🗺️</button>
      </div>
    </div>`;

  view.querySelector('[data-act="retry"]').addEventListener('click', () => openStage(s.id));
  view.querySelector('[data-act="map"]').addEventListener('click', () => { closeArena(); document.getElementById('stages').scrollIntoView({ behavior: 'smooth' }); });
  view.querySelector('[data-act="next"]')?.addEventListener('click', () => openStage(nextStage.id));

  arena.scrollTo({ top: 0 });
  Sound.fanfare();
  burstConfetti(160);

  setTimeout(() => Sound.stamp(), 50);
  // 별 하나씩 등장
  const starEls = view.querySelectorAll('.result__stars span');
  for (let i = 0; i < stars; i++) {
    await sleep(450);
    starEls[i].classList.add('on'); Sound.star();
  }
  // 점수 카운트업
  const el = $('#countScore'); const target = G.score; const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / 900);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  if (stars === 3) setTimeout(() => burstConfetti(200), 600);
}

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------- 이펙트 ---------- */
function popText(text, srcEl, big = false) {
  const layer = $('#fxLayer');
  const el = document.createElement('div');
  el.className = 'fx-pop' + (big ? ' combo' : '');
  el.textContent = text;
  let x = window.innerWidth / 2, y = window.innerHeight * (big ? 0.58 : 0.45);
  if (srcEl && !big) { const r = srcEl.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
  el.style.left = x + 'px'; el.style.top = y + 'px';
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}
function popAt(text, x, y) {
  const el = document.createElement('div');
  el.className = 'fx-pop'; el.textContent = text;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  $('#fxLayer').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}
function flash(kind) {
  const f = document.createElement('div');
  f.className = 'flash ' + kind;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 500);
}

/* 색종이 */
const cv = $('#confetti'); const cx = cv.getContext('2d');
let parts = []; let confettiOn = false;
function sizeCanvas() { cv.width = window.innerWidth * devicePixelRatio; cv.height = window.innerHeight * devicePixelRatio; }
function burstConfetti(n = 100, srcEl = null) {
  const cols = ['#ffd23f', '#ff4d8d', '#2ee6d6', '#3ddc84', '#9b6bff', '#ff9f3d', '#ffffff'];
  let ox = window.innerWidth / 2, oy = window.innerHeight / 3;
  if (srcEl) { const r = srcEl.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2; const sp = 4 + Math.random() * (srcEl ? 7 : 12);
    parts.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (srcEl ? 4 : 8), w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
      r: Math.random() * Math.PI, vr: (Math.random() - .5) * .4, c: cols[i % cols.length], life: 0 });
  }
  if (!confettiOn) { confettiOn = true; requestAnimationFrame(drawConfetti); }
}
function drawConfetti() {
  const dpr = devicePixelRatio;
  cx.clearRect(0, 0, cv.width, cv.height);
  parts.forEach(p => {
    p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    cx.save(); cx.translate(p.x * dpr, p.y * dpr); cx.rotate(p.r);
    cx.fillStyle = p.c; cx.fillRect(-p.w * dpr / 2, -p.h * dpr / 2, p.w * dpr, p.h * dpr * Math.abs(Math.cos(p.life * .1)) + 2);
    cx.restore();
  });
  parts = parts.filter(p => p.y < window.innerHeight + 40 && p.life < 400);
  if (parts.length) requestAnimationFrame(drawConfetti);
  else { confettiOn = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ---------- 이벤트 연결 ---------- */
function init() {
  loadSave();
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  $('#nickInput').value = save.nick || '';
  renderAll();

  // 모든 3D 버튼 클릭음 + 오디오 잠금 해제
  document.addEventListener('pointerdown', (e) => {
    Sound.unlock();
    if (e.target.closest('.btn3d, .chip--btn, .to-top')) {
      Sound.click();
      // 버튼을 누른 자리에서 반짝이 톡!
      const pt = { getBoundingClientRect: () => ({ left: e.clientX, top: e.clientY, width: 0, height: 0 }) };
      burstConfetti(12, pt);
    }
  }, { passive: true });

  // 잠깐 멈추기 (선생님 집중 신호)
  $('#pauseBtn').addEventListener('click', pauseGame);
  $('#resumeBtn').addEventListener('click', resumeGame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });

  // 게임 시작
  $('#startBtn').addEventListener('click', () => {
    const v = $('#nickInput').value.trim();
    save.nick = v; writeSave();
    Sound.start();
    popText(v ? `${v} 입장! 🎮` : '탐정 입장! 🎮', null, true);
    document.getElementById('stages').scrollIntoView({ behavior: 'smooth' });
  });
  $('#nickInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#startBtn').click(); });

  // 스테이지 선택
  $('#stageGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-stage]');
    if (!b) return;
    const v = $('#nickInput').value.trim();
    if (v !== save.nick) { save.nick = v; writeSave(); }
    openStage(b.dataset.stage);
  });

  // 해설 → 다음
  $('#nextBtn').addEventListener('click', nextQuestion);

  // 그만하기
  $('#quitBtn').addEventListener('click', () => {
    if (arena.classList.contains('result-mode')) { closeArena(); return; }
    const wasPaused = G.paused; if (!wasPaused) pauseGame();
    if (confirm('게임을 그만할까요?\n지금 스테이지 점수는 저장되지 않아요.')) closeArena();
    else if (!wasPaused) resumeGame();
  });

  // 키보드: 1~4 숫자키로 보기 선택, O/X 키
  document.addEventListener('keydown', (e) => {
    if (arena.classList.contains('open') && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) { G.paused ? resumeGame() : pauseGame(); return; }
    if (!arena.classList.contains('open') || G.locked || G.paused) return;
    const wrap = view.querySelector('.answers-wrap'); if (!wrap) return;
    const btns = [...wrap.querySelectorAll('.answers button')];
    const k = e.key.toLowerCase();
    if (/^[1-6]$/.test(k) && btns[Number(k) - 1]) btns[Number(k) - 1].click();
    if (k === 'o') wrap.querySelector('[data-v="1"]')?.click();
    if (k === 'x') wrap.querySelector('[data-v="0"]')?.click();
  });

  // 약속 도장
  $('#promiseList').addEventListener('click', (e) => {
    const b = e.target.closest('.promise'); if (!b) return;
    const i = Number(b.dataset.i);
    if (save.promises.includes(i)) save.promises = save.promises.filter(x => x !== i);
    else { save.promises.push(i); Sound.stamp(); }
    writeSave(); renderPromises();
    if (save.promises.length === 5 && !b.dataset.done) {
      Sound.fanfare(); burstConfetti(180); popText('약속 5개 완성! 🛡️', null, true);
    }
  });

  // 기록 초기화
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('모든 별·점수·배지 기록을 지울까요?')) return;
    save = { nick: '', best: {}, promises: [] }; writeSave();
    $('#nickInput').value = ''; renderAll();
  });

  // 효과음 켜기/끄기
  $('#muteBtn').addEventListener('click', () => {
    const m = Sound.toggle();
    $('#muteBtn').textContent = m ? '🔇' : '🔊';
    $('#muteBtn').setAttribute('aria-label', m ? '효과음·배경음악 켜기' : '효과음·배경음악 끄기');
  });

  // 맨위 버튼
  const toTop = $('#toTop');
  const onScroll = () => toTop.classList.toggle('show', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.addEventListener('DOMContentLoaded', init);
