const descCategoriesPerson = [
    // 基礎身份/類別
    [
        "是舊約人物", "是新約人物", "是男性", "是女性", "是君王", "是先知", "是門徒", "是外邦人", "是祭司", "是父母"
    ],
    // 外貌/特徵
    [
        "有特別事蹟", "穿過不同服裝", "拿過武器", "有養動物", "與植物有關", "與數字有關", "與顏色有關", "與光有關", "與聲音有關", "與夜晚有關"
    ],
    // 行為/事件
    [
        "曾經逃跑過", "曾經隱藏身份", "曾經哭泣", "曾經祈禱", "曾經獻祭", "曾經建造東西", "曾經寫過書卷", "曾經旅行遠方", "曾經被囚禁", "曾經被幫助"
    ],
    // 關係/互動
    [
        "有兄弟", "有子女", "與天使互動過", "與敵人對峙過", "與耶穌對話過", "被神直接呼喚", "被同伴背叛", "拯救過他人", "教導過他人", "被異象啟示"
    ],
    // 象徵/隱喻
    [
        "象徵力量", "象徵智慧", "象徵忠誠", "象徵悔改", "象徵救贖", "象徵審判", "比喻為牧者", "比喻為光", "比喻為鹽", "比喻為樹"
    ],
    // 道德/性格
    [
        "曾被考驗", "曾犯過錯", "曾被寬恕", "曾勇敢無畏", "曾猶豫不決", "曾驕傲自大", "曾謙卑順服", "曾慷慨奉獻", "曾說謊欺騙", "曾堅持信仰"
    ],
    // 特殊狀態
    [
        "死裡復活", "改變名字", "失去過東西", "經歷飢餓", "經歷乾旱", "曾經歷風暴", "漂泊流浪", "有錢", "一無所有過", "長壽"
    ],
    // 其他開放聯想
    [
        "與水有關", "與火有關", "與石頭有關", "與食物有關", "與音樂有關", "與夢境有關", "與預言有關", "與家庭有關", "與戰爭有關", "與和平有關"
    ]
];

// 物品題庫
const descCategoriesObject = [
    // 第一輪
    [
        "圓形", "木製", "能發光", "可食用", "可以移動", "有顏色", "柔軟的", "有數字", "會發出聲音", "可以折疊"
    ],
    // 第二輪
    [
        "小型", "金屬製", "透明的", "甜的", "速度快", "藍色的", "彈性大的", "三角形的", "需要敲打", "易碎的"
    ],
    // 第三輪
    [
        "動物", "磁性的", "發熱的", "可飲用", "可以飛", "需要混合", "會發出氣味", "長方形的", "需要轉動", "粘性的"
    ],
    // 第四輪
    [
        "自然界的", "可以切割", "發出光線", "能吃但不能喝", "會跳動", "需要組裝", "有圖案", "需要燃燒", "需要握住", "會流動"
    ],
    // 第五輪
    [
        "在地面上", "可以拉長", "會閃爍", "需要咀嚼", "能跳高", "會旋轉", "需要打開", "會黏住", "可以拋擲", "需要推動"
    ]
];

// 遊戲模式: 'person' 或 'object'
let gameMode = null;
let descCategories = descCategoriesPerson; // 預設

let usedCards = [];
let usedIndexes = [];
let categoryIndex = 0;
let players = ["玩家1", "玩家2"];
let currentPlayer = 0;
let history = [];
let gameActive = false;

const descCardDiv = document.getElementById('desc-card');
const playerTurnDiv = document.getElementById('player-turn');
const answerInput = document.getElementById('answer-input');
const resultDiv = document.getElementById('result');
const historyDiv = document.getElementById('history');

function updatePlayerTurn() {
    playerTurnDiv.textContent = gameActive ? `輪到：${players[currentPlayer]}` : "";
}

function updateHistory() {
    historyDiv.innerHTML = history.map((h, i) => `<div>${h}</div>`).join('');
}

// 新增 deck 堆疊顯示
function updateDeckStack() {
    const deckCardsDiv = document.getElementById('deck-cards');
    const deckCountNum = document.getElementById('deck-count-num');
    // 計算剩餘題目數
    let remain = 0;
    if (usedIndexes.length === 0) {
        remain = descCategories.reduce((a, b) => a + b.length, 0);
    } else {
        remain = descCategories.reduce((sum, cat, i) => sum + (cat.length - (usedIndexes[i]?.length || 0)), 0);
    }
    deckCountNum.textContent = remain;
    // 顯示最多 5 張卡片堆疊
    deckCardsDiv.innerHTML = '';
    const showCount = Math.min(remain, 5);
    for (let i = 0; i < showCount; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'deck-card';
        const cardInner = document.createElement('div');
        cardInner.className = 'deck-card-inner';

        // 正面（背面圖）
        const cardFront = document.createElement('div');
        cardFront.className = 'deck-card-front';

        // 支援三種牌背
        cardFront.style.backgroundImage = `url('${cardbackImg}')`;
        cardFront.style.backgroundSize = 'cover';
        cardFront.style.backgroundPosition = 'center center';
        cardFront.style.backgroundRepeat = 'no-repeat';
        cardFront.style.transform = '';
        cardFront.innerHTML = '';

        // 背面（題目，僅最上層顯示）
        const cardBack = document.createElement('div');
        cardBack.className = 'deck-card-back';
        // 只在最上層卡片顯示題目，且翻轉時動態顯示新題目
        if (usedCards.length === 0 && i === showCount - 1) {
            cardBack.textContent = "開始遊戲";
        } else if (i === showCount - 1 && usedCards.length > 0) {
            // 預設顯示上一輪題目，翻轉時會即時更新
            cardBack.textContent = usedCards[usedCards.length - 1];
        } else {
            cardBack.textContent = '';
        }

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardDiv.appendChild(cardInner);

        if (i === showCount - 1 && remain > 0) {
            cardDiv.title = "抽一張描述卡";
            cardDiv.style.zIndex = 10;
            cardDiv.addEventListener('click', () => {
                if (cardDiv.classList.contains('flipped')) return;
                cardDiv.classList.add('flipped');

                setTimeout(() => {
                    cardDiv.classList.add('shrink');
                    setTimeout(() => {
                        // --- 新增：翻轉時即時顯示新題目 ---
                        let newCardText = "";
                        if (!gameActive && usedCards.length === 0) {
                            // 第一次開始
                            // 預測下一題內容
                            const mode = Math.random() < 0.5 ? 'person' : 'object';
                            newCardText = mode === 'person' ? "請說出一個人名" : "請說出一個物品";
                        } else if (gameActive) {
                            // 取得下一題內容
                            if (usedCards.length === 0) {
                                // 不會進到這裡
                                newCardText = "";
                            } else if (!history[history.length - 1] || !history[history.length - 1].startsWith(players[currentPlayer] + "：")) {
                                // 沒有回答，維持原本題目
                                newCardText = usedCards[usedCards.length - 1];
                            } else {
                                // 預測下一題內容
                                // 找到下一個還有題目的組
                                let tempCategoryIndex = categoryIndex;
                                let found = false;
                                for (let loop = 0; loop < descCategories.length; loop++) {
                                    if (usedIndexes[tempCategoryIndex].length < descCategories[tempCategoryIndex].length) {
                                        found = true;
                                        break;
                                    }
                                    tempCategoryIndex = (tempCategoryIndex + 1) % descCategories.length;
                                }
                                if (found) {
                                    const available = descCategories[tempCategoryIndex]
                                        .map((item, idx) => usedIndexes[tempCategoryIndex].includes(idx) ? null : idx)
                                        .filter(idx => idx !== null);
                                    if (available.length > 0) {
                                        const randIdx = available[Math.floor(Math.random() * available.length)];
                                        newCardText = descCategories[tempCategoryIndex][randIdx];
                                    }
                                }
                            }
                        }
                        // 顯示新題目
                        cardBack.textContent = newCardText || cardBack.textContent;
                        // --- end 新增 ---

                        // ...原本遊戲流程...
                        if (!gameActive && usedCards.length === 0) {
                            nextCard();
                        } else if (gameActive) {
                            const lastHistory = history[history.length - 1] || "";
                            const answered = lastHistory.startsWith(players[currentPlayer] + "：");
                            if (usedCards.length === 0) {
                                nextCard();
                            } else if (!answered) {
                                endGame();
                                updateDeckStack();
                            } else {
                                nextCard();
                            }
                        }
                        setTimeout(() => {
                            cardDiv.classList.remove('flipped', 'shrink');
                        }, 400);
                    }, 300);
                }, 700);
            });
        }
        // 疊放效果
        if (i === 0) cardDiv.style.transform = "translate(0px, 0px) rotate(-4deg)";
        if (i === 1) cardDiv.style.transform = "translate(10px, 12px) rotate(-2deg)";
        if (i === 2) cardDiv.style.transform = "translate(20px, 24px) rotate(2deg)";
        if (i === 3) cardDiv.style.transform = "translate(30px, 36px) rotate(-1deg)";
        if (i === 4) cardDiv.style.transform = "translate(40px, 48px) rotate(3deg)";
        if (i === showCount - 1) cardDiv.style.transform = "translate(60px, 60px) rotate(-1deg) scale(1.08)";
        deckCardsDiv.appendChild(cardDiv);
    }
}

// 修正：只有在玩家沒回答時才結束遊戲，否則正常進行下一回合
function nextCard() {
    // 第一題時決定模式
    if (usedCards.length === 0) {
        // 隨機決定模式
        gameMode = Math.random() < 0.5 ? 'person' : 'object';
        descCategories = (gameMode === 'person') ? descCategoriesPerson : descCategoriesObject;
        usedIndexes = descCategories.map(() => []);
        categoryIndex = 0;
        // 顯示第一題
        if (gameMode === 'person') {
            usedCards.push("請說出一個人名");
        } else {
            usedCards.push("請說出一個物品");
        }
        descCardDiv.textContent = "描述卡：" + usedCards.join("，");
        answerInput.value = "";
        answerInput.disabled = false;
        answerInput.focus();
        resultDiv.textContent = "";
        gameActive = true;
        currentPlayer = 0; // 修正：第一次開始時從玩家1開始
        updatePlayerTurn();
        updateDeckStack();
        return;
    }

    // 若所有組都抽完，遊戲結束
    if (descCategories.every((cat, i) => usedIndexes[i].length >= cat.length)) {
        descCardDiv.textContent = "所有描述卡已用完，遊戲結束！";
        answerInput.disabled = true;
        gameActive = false;
        updateDeckStack();
        return;
    }
    // 找到下一個還有題目的組
    let startIdx = categoryIndex;
    while (usedIndexes[categoryIndex].length >= descCategories[categoryIndex].length) {
        categoryIndex = (categoryIndex + 1) % descCategories.length;
        if (categoryIndex === startIdx) {
            descCardDiv.textContent = "所有描述卡已用完，遊戲結束！";
            answerInput.disabled = true;
            gameActive = false;
            updateDeckStack();
            return;
        }
    }
    // 從該組隨機抽一個沒抽過的
    const available = descCategories[categoryIndex]
        .map((item, idx) => usedIndexes[categoryIndex].includes(idx) ? null : idx)
        .filter(idx => idx !== null);
    const randIdx = available[Math.floor(Math.random() * available.length)];
    usedIndexes[categoryIndex].push(randIdx);
    const card = descCategories[categoryIndex][randIdx];
    usedCards.push(card);
    descCardDiv.textContent = "描述卡：" + usedCards.join("，");
    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.focus();
    resultDiv.textContent = "";
    gameActive = true;
    currentPlayer = (currentPlayer + 1) % players.length;
    updatePlayerTurn();
    updateDeckStack();
    categoryIndex = (categoryIndex + 1) % descCategories.length;
}

// 修正：只有沒回答才會淘汰，否則正常進行下一回合
function submitAnswer() {
    const ans = answerInput.value.trim();
    if (!ans) return;
    history.push(`${players[currentPlayer]}：${ans}`);
    updateHistory();
    answerInput.value = "";
    // 不自動進行下一題，僅記錄回答
}

function endGame() {
    resultDiv.textContent = `${players[currentPlayer]} 說不出，遊戲結束！`;
    answerInput.disabled = true;
    gameActive = false;
}

answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !answerInput.disabled) {
        submitAnswer();
    }
});

const restartBtn = document.getElementById('restart-btn');
restartBtn.addEventListener('click', () => {
    // 重置遊戲狀態，保留玩家人數
    usedCards = [];
    usedIndexes = [];
    categoryIndex = 0;
    history = [];
    gameActive = false;
    currentPlayer = 0;
    gameMode = null;
    descCategories = descCategoriesPerson;
    descCardDiv.textContent = "請點擊左邊卡片開始遊戲";
    answerInput.disabled = true;
    resultDiv.textContent = "";
    updatePlayerTurn();
    updateHistory();
    updateDeckStack();
});

// 玩家人數設定
const playerCountInput = document.getElementById('player-count-input');
playerCountInput.addEventListener('change', () => {
    let n = parseInt(playerCountInput.value, 10);
    if (isNaN(n) || n < 2) n = 2;
    if (n > 10) n = 10;
    playerCountInput.value = n;
    players = Array.from({length: n}, (_, i) => `玩家${i+1}`);
    currentPlayer = 0;
    usedCards = [];
    usedIndexes = [];
    categoryIndex = 0;
    history = [];
    gameActive = false;
    gameMode = null;
    descCategories = descCategoriesPerson;
    descCardDiv.textContent = "請點擊左邊卡片開始遊戲";
    answerInput.disabled = true;
    resultDiv.textContent = "";
    updatePlayerTurn();
    updateHistory();
    updateDeckStack();
});

// 牌背切換功能
const cardbackSelect = document.getElementById('cardback-select');
let cardbackImg = cardbackSelect ? cardbackSelect.value : '卡片背面.png';

if (cardbackSelect) {
    cardbackSelect.addEventListener('change', () => {
        cardbackImg = cardbackSelect.value;
        // 只在換成摩西分紅海時顯示一次故事區塊，之後不再自動顯示
        if (cardbackImg === '卡片背面3.png' && !document.getElementById('moses-story-block')) {
            showMosesStory();
        }
        updateDeckStack();
    });
}

// 初始化
descCardDiv.textContent = "請點擊左邊卡片開始遊戲";
answerInput.disabled = true;
updatePlayerTurn();
updateHistory();
updateDeckStack();

const helpIcon = document.getElementById('help-icon');
const helpTooltip = document.getElementById('help-tooltip');
helpIcon.addEventListener('mouseenter', () => {
    helpTooltip.style.display = 'block';
});
helpIcon.addEventListener('mouseleave', () => {
    helpTooltip.style.display = 'none';
});
helpIcon.addEventListener('focus', () => {
    helpTooltip.style.display = 'block';
});
helpIcon.addEventListener('blur', () => {
    helpTooltip.style.display = 'none';
});

// 跑馬燈內容
const marqueeList = [
    "創世記 - 神創造天地，賦予人類生命。",
    "挪亞方舟 - 挪亞建造方舟，拯救家人與動物免於洪水。",
    "亞伯拉罕獻以撒 - 亞伯拉罕願意獻上兒子，以撒卻被神拯救。",
    "雅各與天使摔跤 - 雅各與天使摔跤後得到了新的名字——以色列。",
    "約瑟的彩衣 - 約瑟被兄弟賣掉，最終成為埃及的宰相。",
    "摩西分紅海 - 摩西舉杖分開紅海，帶領以色列人逃離埃及。",
    "十誡 - 神在西奈山賜給摩西十誡，指引人們的生活。",
    "大衛與歌利亞 - 大衛用一顆石子擊敗巨人歌利亞。",
    "所羅門的智慧 - 所羅門王以智慧判斷兩位母親爭奪嬰兒的案件。",
    "但以理與獅子坑 - 但以理因信仰被丟入獅子坑，卻奇蹟般地存活。",
    "約拿與大魚 - 約拿違背神的命令，被大魚吞下三天後悔改。",
    "耶穌誕生 - 耶穌在伯利恆馬槽中誕生，成為世人的救主。",
    "五餅二魚 - 耶穌用五個餅和兩條魚餵飽五千人。",
    "耶穌行走水面 - 耶穌在風暴中行走於海面，彼得短暫跟隨。",
    "浪子回頭 - 浪子揮霍家產後悔改，父親欣然接納他。",
    "好撒馬利亞人 - 一位撒馬利亞人幫助受傷的陌生人，展現愛心。",
    "耶穌醫治瞎子 - 耶穌使生來瞎眼的人重見光明。",
    "最後的晚餐 - 耶穌與門徒共進晚餐，預告自己的犧牲。",
    "耶穌受難與復活 - 耶穌被釘十字架，三天後復活戰勝死亡。",
    "升天與大使命 - 耶穌升天，囑咐門徒向世界傳揚福音。",
    "亞當與夏娃 - 亞當與夏娃違背神的命令，被逐出伊甸園。",
    "該隱與亞伯 - 該隱因嫉妒殺害弟弟亞伯，成為流浪者。",
    "巴別塔 - 人類試圖建造通天塔，神混亂他們的語言。",
    "羅得的妻子 - 羅得的妻子回頭看所多瑪，被變成鹽柱。",
    "約瑟解夢 - 約瑟為法老解夢，預測七年豐收與七年饑荒。",
    "摩西的荊棘火 - 神在燃燒的荊棘中向摩西顯現，呼召他拯救以色列人。",
    "十災 - 神降下十災懲罰埃及，迫使法老釋放以色列人。",
    "瑪拿與鵪鶉 - 神在曠野賜下瑪拿與鵪鶉，供應以色列人的食物。",
    "約書亞攻占耶利哥 - 以色列人繞城七日，城牆倒塌，攻占耶利哥。",
    "基甸的三百勇士 - 基甸用三百勇士戰勝米甸大軍，顯示神的能力。",
    "參孫與大利拉 - 參孫因愛大利拉而洩露力量的秘密，最終犧牲自己。",
    "路得的忠誠 - 路得忠誠跟隨婆婆拿俄米，成為大衛的祖先。",
    "撒母耳聽見神的聲音 - 撒母耳在夜間聽見神的呼喚，成為先知。",
    "掃羅的悖逆 - 掃羅王違背神的命令，失去王位。",
    "以利亞與巴力先知 - 以利亞在迦密山挑戰巴力先知，神降火顯神蹟。",
    "以利沙使斧頭浮起 - 以利沙使掉入水中的斧頭浮起，顯示神的能力。",
    "尼尼微的悔改 - 約拿傳講神的信息，尼尼微全城悔改。",
    "希西家王的祈禱 - 希西家王祈禱後，神延長他的壽命十五年。",
    "但以理的異象 - 但以理見到四獸異象，預言未來的國度。",
    "三個朋友在火窯 - 沙得拉、米煞、亞伯尼歌在火窯中得神保護。",
    "尼布甲尼撒的夢 - 但以理解釋尼布甲尼撒王的夢，預言未來的國度。",
    "伯沙撒的宴會 - 神的手在牆上寫字，預告巴比倫的滅亡。",
    "但以理在獅子坑 - 但以理因信仰被丟入獅子坑，卻奇蹟般地存活。",
    "以斯帖拯救猶太人 - 以斯帖王后勇敢向王求情，拯救猶太民族。",
    "尼希米重建城牆 - 尼希米帶領百姓重建耶路撒冷的城牆。",
    "約伯的考驗 - 約伯失去一切仍然信靠神，最終得神祝福。",
    "詩篇的讚美 - 詩篇充滿對神的讚美與祈禱。",
    "箴言的智慧 - 所羅門王的箴言教導人如何過智慧的生活。",
    "傳道書的反思 - 傳道書提醒人世間一切皆虛空，唯有敬畏神才有意義。",
    "以賽亞的預言 - 以賽亞預言彌賽亞的降臨與救贖。",
    "耶利米的哀歌 - 耶利米哀嘆耶路撒冷的毀滅，呼籲人悔改。",
    "以西結的異象 - 以西結見到神的榮耀與未來的復興。",
    "但以理的異象 - 但以理見到四獸異象，預言未來的國度。",
    "約拿與尼尼微 - 約拿傳講神的信息，尼尼微全城悔改。",
    "馬利亞領受信息 - 天使向馬利亞宣告她將生下耊穌。",
    "耶穌誕生 - 耶穌在伯利恆馬槽中誕生，成為世人的救主。",
    "東方博士來訪 - 東方博士跟隨星辰來朝拜耶穌。",
    "耶穌受洗 - 耶穌在約旦河受洗，天開了，神的靈降臨。",
    "耶穌受試探 - 耶穌在曠野禁食四十天，抵擋魔鬼的試探。",
    "水變酒 - 耶穌在婚宴上將水變成酒，顯示神蹟。",
    "耶穌醫治癱子 - 耶穌使癱瘓的人站起來行走。",
    "耶穌平息風暴 - 耶穌在海上平息風暴，門徒驚嘆他的能力。",
    "耶穌呼召門徒 - 耶穌呼召彼得、約翰等人成為門徒。",
    "撒馬利亞婦人 - 耶穌向撒馬利亞婦人講述活水的真理。",
    "耶穌醫治血漏婦人 - 一位婦人摸耶穌的衣裳，病得痊癒。",
    "耶穌使瞎子重見光明 - 耶穌使生來瞎眼的人重見光明。",
    "耶穌使拉撒路復活 - 耶穌使死去四天的拉撒路復活。",
    "耶穌進入耶路撒冷 - 耶穌騎驢進入耶路撒冷，眾人夾道歡迎。",
    "最後的晚餐 - 耶穌與門徒共進晚餐，預告自己的犧牲。",
    "彼得三次不認主 - 彼得在雞叫前三次否認認識耶穌。",
    "耶穌受難 - 耶穌被釘十字架，為世人贖罪。",
    "耶穌復活 - 耶穌三天後從死裡復活，戰勝死亡。",
    "多馬的懷疑 - 多馬懷疑耶穌復活，直到親眼見到他。",
    "耶穌升天 - 耶穌升天，囑咐門徒向世界傳揚福音。",
    "五旬節聖靈降臨 - 聖靈降臨，門徒開始傳揚福音。",
    "彼得醫治瘸子 - 彼得使生來瘸腿的人站起來行走。",
    "司提反殉道 - 司提反因信仰被石頭打死，成為第一位殉道者。",
    "保羅的歸信 - 保羅在大馬士革路上遇見耶穌，生命徹底改變。",
    "彼得在異象中見到潔淨食物 - 神向彼得顯示異象，宣告福音向外邦人開放。",
    "保羅的宣教旅程 - 保羅走遍各地傳揚福音，建立教會。",
    "腓立比監獄的奇蹟 - 保羅和西拉在監獄中唱詩，地震使他們得自由。",
    "保羅在雅典講道 - 保羅在雅典向希臘人講述獨一真神。",
    "保羅遭遇船難 - 保羅在海上遇難，卻奇蹟般地存活。",
    "保羅被囚於羅馬 - 保羅在羅馬被囚，仍然寫信鼓勵教會。",
    "啟示錄的異象 - 約翰在拔摩島見到神的異象，預言未來。",
    "新天新地 - 神應許將來會有新天新地，永遠的平安。",
    "羔羊的婚宴 - 信徒將來要與基督一同享受婚宴的喜樂。",
    "撒旦的最終敗亡 - 撒旦最終被神擊敗，永遠被丟入火湖。",
    "生命冊的審判 - 神審判世人，唯有名字在生命冊上的人得救。",
    "耶穌再來 - 耶穌將再來，帶來最終的救贖與審判。",
    "信心的英雄 - 希伯來書列舉眾多信心的英雄，如亞伯拉罕、摩西。",
    "愛的真諦 - 哥林多前書13章講述愛的真正意義。",
    "基督的身體 - 教會是基督的身體，每個信徒都是肢體。",
    "穿戴神的軍裝 - 以弗所書教導信徒穿戴神的軍裝，抵擋邪惡。",
    "天上的寶藏 - 耶穌教導人不要積攢地上的財富，而要積攢天上的財寶。",
    "浪子的回家 - 浪子揮霍家產後悔改，父親欣然接納他。",
    "好牧人 - 耶穌比喻自己是好牧人，願意為羊捨命。",
    "門徒的使命 - 耶穌囑咐門徒向世界傳揚福音。",
    "永恆的生命 - 神應許凡信他的人都能得永恆的生命。"
];

(function marqueeLoop() {
    const marqueeText = document.getElementById('marquee-text');
    let idx = 0;
    function showNext() {
        marqueeText.textContent = marqueeList[idx];
        idx = (idx + 1) % marqueeList.length;
    }
    showNext();
    setInterval(showNext, 3000);
})();

// 題庫視窗功能
const showBankBtn = document.getElementById('show-bank-btn');
const bankModal = document.getElementById('bank-modal');
const bankCloseBtn = document.getElementById('bank-close-btn');
const bankTabs = document.querySelectorAll('.bank-tab');
const bankListDiv = document.getElementById('bank-list');

function renderBankList(type) {
    let data, groupTitles;
    if (type === 'person') {
        data = descCategoriesPerson;
        groupTitles = [
            "基礎身份/類別", "外貌/特徵", "行為/事件", "關係/互動",
            "象徵/隱喻", "道德/性格", "特殊狀態", "其他開放聯想"
        ];
    } else {
        data = descCategoriesObject;
        groupTitles = [
            "第一輪", "第二輪", "第三輪", "第四輪", "第五輪"
        ];
    }
    let html = '';
    data.forEach((group, idx) => {
        html += `<div class="bank-group-title">${groupTitles[idx] || ''}</div>`;
        html += group.map(item => `<div class="bank-list-item">${item}</div>`).join('');
    });
    bankListDiv.innerHTML = html;
}

showBankBtn.addEventListener('click', () => {
    bankModal.style.display = 'flex';
    renderBankList('person');
    bankTabs.forEach(tab => tab.classList.remove('active'));
    bankTabs[0].classList.add('active');
});

bankCloseBtn.addEventListener('click', () => {
    bankModal.style.display = 'none';
});
bankModal.addEventListener('click', e => {
    if (e.target === bankModal) bankModal.style.display = 'none';
});
bankTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        bankTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBankList(tab.dataset.type);
    });
});

function showMosesStory() {
    // 若已存在則不再新增
    if (document.getElementById('moses-story-block')) return;
    const block = document.createElement('div');
    block.id = 'moses-story-block';
    block.style.position = 'fixed';
    block.style.left = '18px';
    block.style.top = '60px';
    block.style.width = '260px';
    block.style.maxWidth = '80vw';
    block.style.background = 'rgba(255,255,240,0.97)';
    block.style.border = '2px solid #bfa76a';
    block.style.borderRadius = '14px';
    block.style.boxShadow = '0 2px 16px rgba(80,60,20,0.13)';
    block.style.padding = '16px 12px 12px 16px';
    block.style.zIndex = 9999;
    block.style.fontSize = '0.95em';
    block.style.lineHeight = '1.6';
    block.style.color = '#5a3c1a';
    block.style.pointerEvents = 'auto';
    block.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:bold;font-size:1.05em;">摩西分紅海的故事</span>
            <button id="moses-story-close" style="background:#fffbe6;border:1px solid #bfa76a;border-radius:8px;padding:2px 8px;font-size:1em;cursor:pointer;margin-left:8px;">關閉</button>
        </div>
        <div style="margin-top:8px;">
        很久以前，以色列人被埃及人當作奴隸，過著辛苦的生活。神選擇了一位領袖——摩西，要他帶領以色列人離開埃及，回到自己的家鄉。<br>
        當摩西終於帶著百姓離開時，埃及法老後悔了，派出大軍追趕他們。以色列人來到一片大海前，前面是海，後面是追兵，大家都非常害怕。<br>
        這時，神對摩西說：「把你的杖舉起來，向海伸手。」摩西照做了，奇蹟發生了——海水分開了！ 左右兩邊像牆一樣立起來，中間變成乾地。<br>
        以色列人就從海中間走過去，一個都沒有被淹到。當他們全部走過去後，摩西再次舉起手，海水合起來，把追趕的埃及軍隊全都淹沒了。<br>
        從那天起，以色列人知道，是神親自拯救了他們，他們也更加相信摩西是神所揀選的領袖。
        </div>
    `;
    document.body.appendChild(block);

    // 關閉按鈕
    const closeBtn = document.getElementById('moses-story-close');
    closeBtn.addEventListener('click', () => {
        if (block.parentNode) block.parentNode.removeChild(block);
    });

    setTimeout(() => {
        if (block.parentNode) block.parentNode.removeChild(block);
    }, 30000);
}

// 這個訊息代表有檔案（如圖片、音效、js、css等）在網頁載入時找不到
// 請檢查你在 HTML 或 JS 裡引用的檔案名稱、路徑是否正確
// 例如：<img src="卡片背面3.png"> 或 <script src="script.js"></script>
// 若你新增了 "火烤.png" 或 "卡片背面3.png" 等圖片，請確認這些檔案已經放在 c:\Users\samue\Downloads\聖經小遊戲 這個資料夾下
// 並且檔名完全一致（包含大小寫）

// 這不是 JS 程式碼錯誤，只是靜態資源找不到，請檢查檔案是否存在於正確資料夾