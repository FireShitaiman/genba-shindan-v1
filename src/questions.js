const questions = [
    // val: Engineering(100) vs Politics(0)
    { text: "図面通りに施工できない時、現場判断で解決することが多い。", stage: "現場のリアル", category: "val" },
    { text: "「とりあえず動けばいい」と誰かが言った瞬間、頭の中で何かが静かに死ぬ。", stage: "現場のリアル", category: "val" },
    { text: "技術的な正論を言うと、現場や上司から煙たがられる雰囲気がある。", stage: "社内政治", category: "val", inverted: true, hook: true },
    { text: "正論を言えばいうほど、現場で浮いていく感覚がある。", stage: "社内政治", category: "val", inverted: true, hook: true },
    { text: "最新技術よりも、枯れた（安定した）技術の方が信頼できると思う。", stage: "現場のリアル", category: "val" },
    { text: "社内規定よりも、「あの人が言ったから」という理由で動くことが多い。", stage: "社内政治", category: "val", inverted: true },
    { text: "トラブル時、原因究明より「誰が責任を取るか」の話が先に出る。", stage: "社内政治", category: "val", inverted: true, hook: true },
    { text: "会議の決定事項より、喫煙所や飲み会での会話で物事が決まる。", stage: "社内政治", category: "val", inverted: true },

    // act: Autonomous(100) vs Cooperative(0)
    { text: "自分が雑に終わらせた仕事を、後から一人でやり直したことがある。", stage: "現場のリアル", category: "act" },
    { text: "工具や計測機器の「クセ」を、自分だけが把握している状態にある。", stage: "現場のリアル", category: "act", hook: true },
    { text: "根回しをしないと、どんなに良い提案でも通らないと確信している。", stage: "社内政治", category: "act", inverted: true },
    { text: "誰かが褒められる場面で、「自分の方が貢献している」と感じることがある。", stage: "社内政治", category: "act" },
    { text: "根回しや調整を、技術の習得と同じくらい重要だと思っている。", stage: "社内政治", category: "act", inverted: true },
    { text: "「できない」と言うよりも、とりあえず「検討します」と逃げる術を覚えた。", stage: "社内政治", category: "act", inverted: true, hook: true },
    { text: "現場の騒音や粉塵の中でも、五感で異常を察知できる自信がある。", stage: "現場のリアル", category: "act" },
    { text: "休日でも、プラントの稼働状況が気になってスマホを見てしまう。", stage: "現場のリアル", category: "act", hook: true },

    // pri: Quality(100) vs Delivery(0)
    { text: "完成品の精度を、要求スペック以上に追い込んでしまうことがある。", stage: "現場のリアル", category: "pri" },
    { text: "安全よりも効率が優先される瞬間を、見て見ぬふりをしたことがある。", stage: "現場のリアル", category: "pri", inverted: true, hook: true },
    { text: "どんなに納期が迫っても、品質基準を自分から下げたことは一度もない。", stage: "現場のリアル", category: "pri" },
    { text: "上層部の顔色を伺って、現場の報告数値を調整することがある。", stage: "社内政治", category: "pri", inverted: true },
    { text: "品質に問題があるとわかりながら、納期に合わせて出荷したことがある。", stage: "生存リスク", category: "pri", inverted: true },
    { text: "責任だけが増えて、裁量や給与が見合っていないと感じる。", stage: "生存リスク", category: "pri", inverted: true, hook: true },
    { text: "家族や友人よりも、現場のトラブル対応を優先するのが常識になっている。", stage: "生存リスク", category: "pri", inverted: true, hook: true },

    // mnd: Resilient(100) vs Sensitive(0)
    { text: "多少のトラブルでは動じない。いつものことだと思っている。", stage: "現場のリアル", category: "mnd" },
    { text: "転職を調べたことがある。ただ、行動には移していない。", stage: "生存リスク", category: "mnd", inverted: true, hook: true },
    { text: "このまま10年後の自分を想像すると、少し怖くなる。", stage: "生存リスク", category: "mnd", inverted: true },
    { text: "現場が荒れていても、自分のペースを崩さない自信がある。", stage: "現場のリアル", category: "mnd" },
    { text: "朝、会社（現場）に行くのが、肉体的にではなく「心理的に」辛い日がある。", stage: "生存リスク", category: "mnd", inverted: true, hook: true },
    { text: "今のスキルが、他社や他業界で通用するイメージが全く湧かない。", stage: "生存リスク", category: "mnd", inverted: true },
    { text: "正直に言うと、今すぐすべてを投げ出して逃げ出したい瞬間がある。", stage: "生存リスク", category: "mnd", inverted: true, hook: true }
];