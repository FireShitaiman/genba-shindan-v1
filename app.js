(function () {
    'use strict';

    // ========================
    // State (カプセル化 - コンソールからの改ざんを抑制)
    // ========================
    const AppState = {
        currentQuestionIndex: 0,
        answers: [],
        activeQuestions: [],
        chartInstance: null,
        quizMode: 'full',
    };

    // ========================
    // DOM Cache (起動時に一括取得)
    // ========================
    const El = {};

    function initElements() {
        const ids = {
            hero:                'hero',
            quiz:                'quiz',
            transitionScreen:    'transition-screen',
            loadingScreen:       'loading-screen',
            result:              'result',
            disclaimerModal:     'disclaimer-modal',
            stageLabel:          'stage-label',
            stepCounter:         'step-counter',
            progressBar:         'progress-bar',
            progressPercent:     'progress-percent',
            questionText:        'question-text',
            optionsContainer:    'options-container',
            transitionTitle:     'transition-title',
            transitionMessage:   'transition-message',
            resultCharacter:     'result-character',
            resultTypeTitle:     'result-type-title',
            resultPunchline:     'result-punchline',
            resultDescription:   'result-description',
            resultNickname:      'result-nickname',
            resultAdvice:        'result-advice',
            resultQuotes:        'result-quotes',
            marketValueBar:      'market-value-bar',
            marketValuePercent:  'market-value-percent',
            marketValueStatus:   'market-value-status',
            marketValueMessage:  'market-value-message',
            survivalBar:         'survival-bar',
            survivalPercent:     'survival-percent',
            survivalStatus:      'survival-status',
            survivalMessage:     'survival-message',
            bestMatch:           'best-match',
            worstMatch:          'worst-match',
            affiliateContainer:  'affiliate-container',
            shareX:              'share-x',
            shareLine:           'share-line',
            resultChart:         'resultChart',
            btnQuick:            'btn-quick',
            btnFull:             'btn-full',
            btnNextStage:        'btn-next-stage',
            btnRestart:          'btn-restart',
            btnCloseDisclaimer:  'btn-close-disclaimer',
            linkDisclaimer:      'link-disclaimer',
        };
        Object.entries(ids).forEach(([key, id]) => { El[key] = document.getElementById(id); });
    }

    // ========================
    // Section Visibility
    // ========================
    function showOnly(target) {
        [El.hero, El.quiz, El.transitionScreen, El.loadingScreen, El.result].forEach(el => {
            el.classList.toggle('hidden', el !== target);
        });
    }

    // ========================
    // Quiz Logic
    // ========================
    function startQuiz(mode) {
        AppState.quizMode = mode;
        AppState.currentQuestionIndex = 0;
        AppState.answers = [];

        if (mode === 'quick') {
            const cats = ['val', 'act', 'pri', 'mnd'];
            AppState.activeQuestions = cats.flatMap(cat =>
                questions.filter(q => q.category === cat)
                         .sort(() => 0.5 - Math.random())
                         .slice(0, 3)
            );
        } else {
            AppState.activeQuestions = [...questions].sort(() => 0.5 - Math.random());
        }

        showOnly(El.quiz);
        showQuestion();
    }

    function showQuestion() {
        const { currentQuestionIndex, activeQuestions } = AppState;
        const question = activeQuestions[currentQuestionIndex];
        const total = activeQuestions.length;
        const progress = (currentQuestionIndex / total) * 100;

        El.questionText.textContent = question.text;
        El.stageLabel.textContent = `Stage ${Math.floor(currentQuestionIndex / 10) + 1}: ${question.stage}`;
        El.progressBar.style.width = `${progress}%`;
        El.progressPercent.textContent = `${Math.round(progress)}% Complete`;

        // step counter: "01 /30" with styled span (innerHTML の代わりに安全なDOM操作)
        El.stepCounter.textContent = '';
        El.stepCounter.appendChild(
            document.createTextNode(String(currentQuestionIndex + 1).padStart(2, '0'))
        );
        const totalSpan = document.createElement('span');
        totalSpan.className = 'text-sm font-normal';
        totalSpan.textContent = `/${total}`;
        El.stepCounter.appendChild(totalSpan);

        El.optionsContainer.textContent = '';
        CHOICES.forEach(choice => El.optionsContainer.appendChild(createChoiceButton(choice)));
    }

    function createChoiceButton(choice) {
        const btn = document.createElement('button');
        btn.className = `flex flex-col items-center justify-center p-2 py-8 md:py-12 rounded-2xl border transition-all duration-200 group ${choice.color} text-center shadow-lg transform hover:-translate-y-1`;

        const label = document.createElement('span');
        label.className = 'text-[10px] md:text-xs font-black mb-3 uppercase tracking-tighter text-white/90 group-hover:text-white leading-none h-8 flex items-center';
        label.textContent = choice.label;

        const ring = document.createElement('div');
        ring.className = 'w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white transition-colors';
        const dot = document.createElement('div');
        dot.className = 'w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity';
        ring.appendChild(dot);

        btn.appendChild(label);
        btn.appendChild(ring);
        btn.addEventListener('click', () => selectOption(choice.score));
        return btn;
    }

    function selectOption(score) {
        AppState.answers.push(score);
        if (AppState.currentQuestionIndex < AppState.activeQuestions.length - 1) {
            AppState.currentQuestionIndex++;
            if (AppState.currentQuestionIndex % 10 === 0) {
                showTransition();
            } else {
                showQuestion();
            }
        } else {
            showLoading();
        }
    }

    function showTransition() {
        showOnly(El.transitionScreen);
        const stageNum = Math.floor(AppState.currentQuestionIndex / 10);
        El.transitionTitle.textContent = `Stage ${stageNum} クリア`;
        El.transitionMessage.textContent = '現場の現実はさらに深層へ。次のチェックポイントを通過してください。';
    }

    function nextStage() {
        showOnly(El.quiz);
        showQuestion();
    }

    function showLoading() {
        showOnly(El.loadingScreen);
        setTimeout(calculateResult, 2000);
    }

    // ========================
    // Score Calculation (共通化)
    // ========================
    function calculateCategoryScores() {
        const stats = { val: [], act: [], pri: [], mnd: [] };
        AppState.answers.forEach((score, i) => {
            const q = AppState.activeQuestions[i];
            stats[q.category].push(q.inverted ? 100 - score : score);
        });
        const avg = arr => arr.length
            ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
            : 50;
        return { val: avg(stats.val), act: avg(stats.act), pri: avg(stats.pri), mnd: avg(stats.mnd) };
    }

    function generateTypeCode(scores) {
        return [
            scores.val >= 50 ? 'E' : 'P',
            scores.act >= 50 ? 'A' : 'C',
            scores.pri >= 50 ? 'Q' : 'D',
            scores.mnd >= 50 ? 'R' : 'V',
        ].join('');
    }

    function calculateResult() {
        const scores = calculateCategoryScores();
        const typeCode = generateTypeCode(scores);
        const persona = PERSONA_TYPES[typeCode] || PERSONA_TYPES['ECDV'];

        showOnly(El.result);
        updateResultUI(persona, typeCode);
        updateMarketValueUI(scores.val);
        updateSurvivalUI(scores.mnd);
        updateQuotesUI(persona.quotes);
        updateMatchUI(persona);
        updateAffiliateUI(persona);
        setupShareButtons(persona);
        renderChart(scores);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========================
    // Result UI (純粋なtextContent / DOM操作のみ)
    // ========================
    function updateResultUI(persona, code) {
        El.resultCharacter.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(code)}&backgroundColor=transparent&primaryColor=ea580c`;
        El.resultCharacter.alt = `${persona.name}のキャラクター`;
        El.resultTypeTitle.textContent = persona.name;
        El.resultPunchline.textContent = persona.punchline;
        El.resultDescription.textContent = persona.description;
        El.resultNickname.textContent = `「${persona.nickname}」`;
        El.resultAdvice.textContent = persona.advice;
    }

    // ========================
    // Tiered Status Bars (DRY: 共通関数で市場価値・生存率を処理)
    // ========================
    const MARKET_VALUE_TIERS = [
        { min: 80, status: 'Appraisal: High Value',  cls: 'text-purple-400', msg: '現場を支える希少な技術者。政治に惑わされず、その腕一本でどこでも生きていける「本物」の価値があります。' },
        { min: 50, status: 'Appraisal: Specialized', cls: 'text-blue-400',   msg: '安定した技術と調整能力を兼ね備えています。今の組織に留まらず、より上位のステージへ進むポテンシャルを秘めています。' },
        { min: -1, status: 'Appraisal: Generalist',  cls: 'text-slate-400',  msg: '技術よりも組織内調整に特化しています。汎用性は高いですが、特定の技術領域では足元を見られるリスクがあります。' },
    ];

    const SURVIVAL_TIERS = [
        { min: 80, status: 'Condition: Stable',        cls: 'text-emerald-500',           msg: '現場の毒素への高い耐性を維持しています。しかし、その強さは「感覚の麻痺」によるものかもしれません。' },
        { min: 50, status: 'Condition: Warning',       cls: 'text-orange-500',            msg: '精神的な摩耗が無視できないレベルです。まだ踏み止まれますが、ふとした瞬間にダムが決壊する予兆があります。' },
        { min: 25, status: 'Condition: Critical',      cls: 'text-red-400',               msg: '過労死ラインの住人です。心が完全に摩耗しきる前に、新しい環境（酸素）を吸いに行く準備を始めてください。' },
        { min: -1, status: 'Condition: Dead or Alive', cls: 'text-red-600 animate-pulse', msg: '生存確率は極めて低いです。このまま今の現場に居続けることは、キャリアだけでなく人生そのものの毀損に直結します。今すぐこのページ下のリンクから脱出先を探すべきです。' },
    ];

    function applyTier(tiers, score, barEl, percentEl, statusEl, messageEl) {
        const tier = tiers.find(t => score > t.min);
        percentEl.textContent = `${score}%`;
        barEl.style.width = `${score}%`;
        statusEl.textContent = tier.status;
        statusEl.className = `text-xs font-black italic uppercase tracking-widest leading-none ${tier.cls}`;
        messageEl.textContent = tier.msg;
    }

    function updateMarketValueUI(valScore) {
        applyTier(MARKET_VALUE_TIERS, valScore,
            El.marketValueBar, El.marketValuePercent, El.marketValueStatus, El.marketValueMessage);
    }

    function updateSurvivalUI(survivalRate) {
        applyTier(SURVIVAL_TIERS, survivalRate,
            El.survivalBar, El.survivalPercent, El.survivalStatus, El.survivalMessage);
    }

    // ========================
    // Quotes (textContent で XSS 排除)
    // ========================
    function updateQuotesUI(quotes) {
        El.resultQuotes.textContent = '';
        quotes.forEach(quote => {
            const div = document.createElement('div');
            div.className = 'bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-slate-300 italic text-sm';
            div.textContent = quote;
            El.resultQuotes.appendChild(div);
        });
    }

    // ========================
    // Match Cards (純粋関数でビューを生成)
    // ========================
    function buildMatchCard(containerEl, persona, matchKey, role) {
        const matched = PERSONA_TYPES[matchKey];
        const isGood = role === 'best';
        const accentCls = isGood ? 'text-emerald-500' : 'text-red-500';

        containerEl.textContent = '';

        const labelEl = document.createElement('p');
        labelEl.className = `${accentCls} font-bold text-xs mb-4 uppercase tracking-widest`;
        labelEl.textContent = isGood ? 'Best Partner / 相棒' : 'Worst Match / 天敵';

        const img = document.createElement('img');
        img.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(matchKey)}&backgroundColor=transparent`;
        img.alt = `${matched.name}のキャラクター`;
        img.className = 'w-16 h-16 mx-auto mb-2 drop-shadow-md';

        const nameEl = document.createElement('h4');
        nameEl.className = 'text-white font-bold text-sm';
        nameEl.textContent = matched.name;

        const reasonEl = document.createElement('p');
        reasonEl.className = 'text-[10px] text-slate-400 mt-2 leading-tight';
        reasonEl.textContent = isGood ? persona.bestReason : persona.worstReason;

        containerEl.append(labelEl, img, nameEl, reasonEl);
    }

    function updateMatchUI(persona) {
        buildMatchCard(El.bestMatch,  persona, persona.bestMatch,  'best');
        buildMatchCard(El.worstMatch, persona, persona.worstMatch, 'worst');
    }

    // ========================
    // Affiliate Cards (設定をデータで管理)
    // ========================
    const AFFILIATE_CONFIG = [
        {
            accentCls:    'text-orange-500',
            borderHover:  'hover:border-orange-500/50',
            titleHoverCls:'group-hover:text-orange-500',
            labelText:    'Sponsored',
            getTitle:     persona => `【現場脱出】${persona.name}に最適な非公開求人`,
            bodyText:     '今のあなたの市場価値なら、年収+100万のチャンス。最短30日のスピード内定実績あり。',
            url:          'https://example.com/dummy-affiliate-1',
        },
        {
            accentCls:    'text-blue-500',
            borderHover:  'hover:border-blue-500/50',
            titleHoverCls:'group-hover:text-blue-500',
            labelText:    'AD / 転職サポート',
            getTitle:     () => '「現場の政治」に疲れたエンジニア専用エージェント',
            bodyText:     '技術魂を正当に評価する、ホワイトな環境への転身をフルサポート。',
            url:          'https://example.com/dummy-affiliate-2',
        },
    ];

    function buildAffiliateCard(cfg, persona) {
        const div = document.createElement('div');
        div.className = `bg-white/5 p-4 rounded-xl border border-white/10 ${cfg.borderHover} transition-colors cursor-pointer group`;
        div.setAttribute('role', 'link');
        div.setAttribute('tabindex', '0');

        const label = document.createElement('p');
        label.className = `text-[10px] ${cfg.accentCls} font-bold mb-1 uppercase tracking-tighter`;
        label.textContent = cfg.labelText;

        const title = document.createElement('h4');
        title.className = `text-md font-bold text-white ${cfg.titleHoverCls} transition-colors`;
        title.textContent = cfg.getTitle(persona);

        const body = document.createElement('p');
        body.className = 'text-xs text-slate-400 mt-1';
        body.textContent = cfg.bodyText;

        div.append(label, title, body);

        const open = () => window.open(cfg.url, '_blank', 'noopener,noreferrer');
        div.addEventListener('click', open);
        div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
        return div;
    }

    function updateAffiliateUI(persona) {
        El.affiliateContainer.textContent = '';
        AFFILIATE_CONFIG.forEach(cfg => El.affiliateContainer.appendChild(buildAffiliateCard(cfg, persona)));
    }

    // ========================
    // Share Buttons
    // ========================
    function setupShareButtons(persona) {
        const baseUrl = window.location.protocol === 'file:'
            ? 'https://genba-shindan.example.com'
            : window.location.href;
        const url = encodeURIComponent(baseUrl);

        El.shareX.onclick = () => {
            const text = encodeURIComponent(`現場特性診断の結果は【${persona.name}】でした！\n${persona.punchline}\n#現場の真実診断 #エンジニア診断`);
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
        };
        El.shareLine.onclick = () => {
            const text = encodeURIComponent(`現場特性診断の結果は【${persona.name}】でした！\n${persona.punchline}\n#現場の真実診断`);
            window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
        };
    }

    // ========================
    // Chart
    // ========================
    function renderChart(scores) {
        if (AppState.chartInstance) AppState.chartInstance.destroy();
        AppState.chartInstance = new Chart(El.resultChart.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['技術魂 (Eng)', '現場判断 (Auto)', '品質矜持 (Qual)', '不屈の心 (Res)'],
                datasets: [
                    {
                        label: 'あなたの特性',
                        data: [scores.val, scores.act, scores.pri, scores.mnd],
                        fill: true,
                        backgroundColor: 'rgba(234, 88, 12, 0.2)',
                        borderColor: 'rgb(234, 88, 12)',
                        pointBackgroundColor: 'rgb(234, 88, 12)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(234, 88, 12)',
                    },
                    {
                        label: '一般的な現場人',
                        data: TYPICAL_GENBA_SCORES,
                        fill: true,
                        backgroundColor: 'rgba(71, 85, 105, 0.2)',
                        borderColor: 'rgba(71, 85, 105, 0.8)',
                        pointBackgroundColor: 'rgba(71, 85, 105, 1)',
                        pointBorderColor: '#fff',
                        borderDash: [5, 5],
                    },
                ],
            },
            options: {
                scales: {
                    r: {
                        angleLines:  { color: 'rgba(255, 255, 255, 0.1)' },
                        grid:        { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 12, weight: 'bold' } },
                        ticks:       { display: false, stepSize: 20 },
                        suggestedMin: 0,
                        suggestedMax: 100,
                    },
                },
                plugins: {
                    legend: { labels: { color: '#f8fafc', font: { size: 12 } } },
                },
            },
        });
    }

    // ========================
    // Disclaimer
    // ========================
    function toggleDisclaimer() {
        El.disclaimerModal.classList.toggle('hidden');
    }

    // ========================
    // Init (onclick属性を排除し、ここで一元管理)
    // ========================
    function init() {
        initElements();
        El.btnQuick.addEventListener('click', () => startQuiz('quick'));
        El.btnFull.addEventListener('click',  () => startQuiz('full'));
        El.btnNextStage.addEventListener('click', nextStage);
        El.btnRestart.addEventListener('click', () => location.reload());
        El.btnCloseDisclaimer.addEventListener('click', toggleDisclaimer);
        El.linkDisclaimer.addEventListener('click', toggleDisclaimer);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
