(function () {
    'use strict';

    // ========================
    // State (カプセル化 - コンソールからの改ざんを抑制)
    // ========================
    const AppState = {
        currentQuestionIndex: 0,
        answers: [],
        activeQuestions: [],
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
            affiliateContainer:  'affiliate-container',
            shareX:              'share-x',
            shareLine:           'share-line',
            quizMeta:            'quiz-meta',
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
            AppState.activeQuestions = questions.filter(q => q.hook);
        } else {
            AppState.activeQuestions = [...questions].sort(() => 0.5 - Math.random());
        }

        El.quizMeta.classList.toggle('hidden', mode === 'quick');

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
            if (AppState.quizMode !== 'quick' && AppState.currentQuestionIndex % 10 === 0) {
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

        const isFull = AppState.quizMode === 'full';
        ['section-score', 'section-compat', 'section-quotes'].forEach(id => {
            document.getElementById(id).classList.toggle('hidden', !isFull);
        });
        if (isFull) {
            updateScoreBreakdownUI(scores);
            updateCompatibilityUI(persona);
            updateQuotesUI(persona);
        }

        updateAffiliateUI(persona);
        setupShareButtons(persona);
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
    // Affiliate Cards
    // ========================
    const AFFILIATE_CONFIG = [
        {
            badge:       'PR',
            accentCls:   'text-orange-400',
            borderCls:   'border-orange-500/25',
            hoverBorder: 'hover:border-orange-500/60',
            btnCls:      'bg-orange-600 hover:bg-orange-500',
            company:     'ランスタッド株式会社',
            getJobTitle: persona => `製造・技術職エージェント【${persona.name}タイプ歓迎】`,
            catchCopy:   '現場経験を正当に評価する職場へ。非公開求人を含む3,000件以上を無料紹介。',
            location:    '全国対応（愛知・大阪・関東ほか）',
            salary:      '年収 400〜800万',
            type:        '正社員・契約社員',
            tags:        ['非公開求人あり', '転職サポート無料', '最短即日紹介'],
            url:         'https://example.com/dummy-affiliate-1',
        },
        {
            badge:       'AD',
            accentCls:   'text-blue-400',
            borderCls:   'border-blue-500/25',
            hoverBorder: 'hover:border-blue-500/60',
            btnCls:      'bg-blue-600 hover:bg-blue-500',
            company:     'メイテックネクスト',
            getJobTitle: () => '施工管理・生産技術 専門求人サイト',
            catchCopy:   '工場・建設系に特化した転職サービス。資格取得支援ありのホワイト企業を厳選掲載。',
            location:    '東海・関西・関東 多数',
            salary:      '年収 350〜700万',
            type:        '正社員',
            tags:        ['施工管理技士 歓迎', '完全週休2日', '資格取得支援'],
            url:         'https://example.com/dummy-affiliate-2',
        },
    ];

    function buildAffiliateCard(cfg, persona) {
        const div = document.createElement('div');
        div.className = `relative bg-slate-800/60 border ${cfg.borderCls} ${cfg.hoverBorder} rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group`;
        div.setAttribute('role', 'link');
        div.setAttribute('tabindex', '0');

        div.innerHTML = `
            <div class="p-5">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded font-bold tracking-widest uppercase">${cfg.badge}</span>
                    <span class="${cfg.accentCls} text-xs font-bold truncate ml-2">${cfg.company}</span>
                </div>
                <h4 class="text-sm font-black text-white group-hover:${cfg.accentCls} transition-colors leading-snug mb-2">${cfg.getJobTitle(persona)}</h4>
                <p class="text-xs text-slate-400 leading-relaxed mb-4">${cfg.catchCopy}</p>
                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${cfg.tags.map(t => `<span class="text-[11px] bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full">${t}</span>`).join('')}
                </div>
                <div class="flex items-end justify-between pt-3 border-t border-slate-700/50">
                    <div class="text-[11px] text-slate-500 leading-relaxed">
                        <div>📍 ${cfg.location}</div>
                        <div>💴 ${cfg.salary}　${cfg.type}</div>
                    </div>
                    <button class="${cfg.btnCls} text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-3 flex-shrink-0">詳細を見る →</button>
                </div>
            </div>
        `;

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
    // Score Breakdown
    // ========================
    const SCORE_AXES = [
        { key: 'val', labelHigh: 'やりがい重視',   labelLow: '条件・待遇重視', desc: '仕事への向き合い方', clsHigh: 'from-orange-600 to-orange-400', clsLow: 'from-blue-600 to-blue-400' },
        { key: 'act', labelHigh: '行動派',          labelLow: '慎重派',         desc: '物事の進め方',       clsHigh: 'from-emerald-600 to-emerald-400', clsLow: 'from-purple-600 to-purple-400' },
        { key: 'pri', labelHigh: '品質優先',        labelLow: 'スピード優先',   desc: '仕事のこだわり',    clsHigh: 'from-cyan-600 to-cyan-400', clsLow: 'from-rose-600 to-rose-400' },
        { key: 'mnd', labelHigh: '現実主義',        labelLow: '理想主義',       desc: '物の見方',          clsHigh: 'from-slate-500 to-slate-300', clsLow: 'from-yellow-500 to-yellow-300' },
    ];

    function updateScoreBreakdownUI(scores) {
        const container = document.getElementById('score-breakdown');
        container.textContent = '';
        SCORE_AXES.forEach(axis => {
            const score   = scores[axis.key];
            const isHigh  = score >= 50;
            const primary = isHigh ? axis.labelHigh : axis.labelLow;
            const secondary = isHigh ? axis.labelLow : axis.labelHigh;
            const barWidth  = isHigh ? score : (100 - score);
            const barCls    = isHigh ? axis.clsHigh : axis.clsLow;

            const wrapper = document.createElement('div');
            wrapper.className = 'space-y-1.5';

            const row = document.createElement('div');
            row.className = 'flex justify-between items-baseline';

            const primaryEl = document.createElement('span');
            primaryEl.className = 'text-xs font-black text-white';
            primaryEl.textContent = primary;

            const secondaryEl = document.createElement('span');
            secondaryEl.className = 'text-[10px] text-slate-600';
            secondaryEl.textContent = `← ${secondary}`;

            row.appendChild(primaryEl);
            row.appendChild(secondaryEl);

            const track = document.createElement('div');
            track.className = 'w-full bg-slate-800 h-2 rounded-full overflow-hidden';

            const fill = document.createElement('div');
            fill.className = `bg-gradient-to-r ${barCls} h-full rounded-full transition-all duration-700`;
            fill.style.width = `${barWidth}%`;

            track.appendChild(fill);
            wrapper.appendChild(row);
            wrapper.appendChild(track);
            container.appendChild(wrapper);
        });
    }

    // ========================
    // Compatibility
    // ========================
    function updateCompatibilityUI(persona) {
        const container = document.getElementById('compatibility-section');
        container.textContent = '';
        const configs = [
            {
                code:      persona.bestMatch,
                reason:    persona.bestReason,
                label:     '最高の相棒',
                icon:      '✦',
                borderCls: 'border-emerald-500/30 bg-emerald-500/5',
                accentCls: 'text-emerald-400',
            },
            {
                code:      persona.worstMatch,
                reason:    persona.worstReason,
                label:     '最悪の相手',
                icon:      '✕',
                borderCls: 'border-red-500/30 bg-red-500/5',
                accentCls: 'text-red-400',
            },
        ];
        configs.forEach(cfg => {
            const target = PERSONA_TYPES[cfg.code];
            if (!target) return;

            const card = document.createElement('div');
            card.className = `border ${cfg.borderCls} rounded-xl p-4`;

            const labelEl = document.createElement('p');
            labelEl.className = `text-[10px] font-bold uppercase tracking-widest ${cfg.accentCls} mb-1`;
            labelEl.textContent = cfg.label;

            const nameEl = document.createElement('p');
            nameEl.className = 'text-sm font-black text-white mb-2';
            nameEl.textContent = `${cfg.icon} ${target.name}`;

            const reasonEl = document.createElement('p');
            reasonEl.className = 'text-xs text-slate-400 leading-relaxed';
            reasonEl.textContent = cfg.reason;

            card.appendChild(labelEl);
            card.appendChild(nameEl);
            card.appendChild(reasonEl);
            container.appendChild(card);
        });
    }

    // ========================
    // Quotes
    // ========================
    function updateQuotesUI(persona) {
        const container = document.getElementById('quotes-section');
        container.textContent = '';
        persona.quotes.forEach(quote => {
            const div = document.createElement('div');
            div.className = 'bg-slate-800/50 border border-slate-700/50 rounded-xl p-4';

            const text = document.createElement('p');
            text.className = 'text-slate-300 text-sm italic leading-relaxed';
            text.textContent = quote;

            div.appendChild(text);
            container.appendChild(div);
        });
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
