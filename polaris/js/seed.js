/*
 * Polaris Demo Seed
 * -----------------
 * Loads a realistic, evidence-rich journey for a sample child so the platform
 * is immediately meaningful. Everything seeded here flows through the same
 * engine the live product uses — nothing is hard-coded intelligence.
 */
(function (P) {
  "use strict";

  var DAY = 24 * 60 * 60 * 1000;
  function daysAgo(n) { return Date.now() - n * DAY; }

  P.loadDemo = function () {
    var s = P.emptyState();
    s.onboarded = true;
    s.isDemo = true; // flags this as the sample child so the UI can say so
    s.profile = {
      name: "Aanya",
      age: 9,
      avatar: "🌸",
      interests: ["science", "art", "helping", "stories"],
      personality: ["collaborative", "reflective", "organized"],
      goals: ["confidence", "creativity", "resilience"],
      concerns: "Sometimes hesitant to speak up in groups.",
      createdAt: daysAgo(54),
    };

    // Observations from multiple observers, contexts and dates (drives confidence).
    var obs = [
      { observer: "parent", context: "home", competency: "curiosity", text: "Took apart an old clock to see how it worked.", evidenceType: "observation", date: daysAgo(50) },
      { observer: "parent", context: "home", competency: "curiosity", text: "Asked why the sky changes colour at sunset.", evidenceType: "observation", date: daysAgo(30) },
      { observer: "teacher", context: "school", competency: "curiosity", text: "Stayed back to ask extra questions about volcanoes.", evidenceType: "observation", date: daysAgo(22) },
      { observer: "parent", context: "home", competency: "kindness", text: "Made a get-well card for a sick friend unprompted.", evidenceType: "observation", date: daysAgo(44) },
      { observer: "teacher", context: "school", competency: "kindness", text: "Helped a new classmate find their way around.", evidenceType: "observation", date: daysAgo(18) },
      { observer: "parent", context: "home", competency: "making", text: "Built a cardboard marble run over the weekend.", evidenceType: "observation", date: daysAgo(40) },
      { observer: "parent", context: "home", competency: "creative_thinking", text: "Invented a board game with her own rules.", evidenceType: "observation", date: daysAgo(26) },
      { observer: "parent", context: "home", competency: "empathy", text: "Comforted her younger brother when he fell.", evidenceType: "observation", date: daysAgo(20) },
      { observer: "coach", context: "sports", competency: "teamwork", text: "Cheered on teammates during the relay.", evidenceType: "observation", date: daysAgo(12) },
      { observer: "parent", context: "home", competency: "resilience", text: "Re-built her project after it collapsed, without giving up.", evidenceType: "observation", date: daysAgo(9) },
      { observer: "parent", context: "home", competency: "responsibility", text: "Fed and walked the dog all week without reminders.", evidenceType: "observation", date: daysAgo(6) },
      { observer: "teacher", context: "school", competency: "focus", text: "Completed a 30-minute reading task fully absorbed.", evidenceType: "observation", date: daysAgo(4) },
    ];
    s.observations = obs.map(function (o) { o.id = P.uid("obs"); return o; }).sort(function (a, b) { return b.date - a.date; });

    // A couple of portfolio artifacts.
    s.evidence = [
      { id: P.uid("ev"), type: "project", title: "Cardboard Marble Run", note: "Aanya's weekend engineering build.", competency: "making", date: daysAgo(40), dataUrl: null },
      { id: P.uid("ev"), type: "note", title: "Invented Board Game", note: "Hand-drawn rules and a custom dice.", competency: "creative_thinking", date: daysAgo(26), dataUrl: null },
    ];

    // Completed experiences (each generates evidence via the engine path).
    var completed = [
      { experienceId: "exp_science_quest", reflection: "The volcano fizzed way more than I guessed! I want to try vinegar amounts next.", daysAgoStart: 28, daysAgoEnd: 27 },
      { experienceId: "exp_kindness_mission", reflection: "I left a thank-you note for our building guard. It felt really nice.", daysAgoStart: 15, daysAgoEnd: 14 },
      { experienceId: "exp_recycle_build", reflection: "My robot's arm kept falling so I taped it stronger. Version 2 is better!", daysAgoStart: 8, daysAgoEnd: 7 },
    ];

    completed.forEach(function (c) {
      var exp = P.experienceById[c.experienceId];
      if (!exp) return;
      var inst = {
        id: P.uid("xp"), experienceId: c.experienceId, status: "completed",
        source: "recommendation", startedAt: daysAgo(c.daysAgoStart), completedAt: daysAgo(c.daysAgoEnd),
        evidenceIds: [], reflectionId: null,
      };
      // generate evidence observations for targets
      exp.targets.forEach(function (cid) {
        var o = { id: P.uid("obs"), observer: "experience", context: "experience", competency: cid,
          text: "Completed the experience: " + exp.title, evidenceType: "experience", sourceExperience: exp.id, date: daysAgo(c.daysAgoEnd) };
        s.observations.unshift(o);
        inst.evidenceIds.push(o.id);
      });
      var ref = { id: P.uid("ref"), by: "child", text: c.reflection, experienceId: c.experienceId, date: daysAgo(c.daysAgoEnd) };
      s.reflections.unshift(ref);
      inst.reflectionId = ref.id;
      s.experiences.unshift(inst);
    });

    s.observations.sort(function (a, b) { return b.date - a.date; });
    s.reflections.sort(function (a, b) { return b.date - a.date; });

    // Generate Child Growth Moments retrospectively for the seeded evidence.
    s.cgms = [];
    var moments = [
      { kind: "experience", competency: "curiosity", text: "Completed Kitchen Science Quest, generating fresh evidence.", date: daysAgo(27) },
      { kind: "observation", competency: "kindness", text: "New observation captured for Kindness & Service.", date: daysAgo(18) },
      { kind: "experience", competency: "problem_solving", text: "An adventure was completed, generating fresh evidence.", date: daysAgo(7) },
      { kind: "observation", competency: "resilience", text: "New observation captured for Resilience.", date: daysAgo(9) },
      { kind: "observation", competency: "focus", text: "New observation captured for Focus & Attention.", date: daysAgo(4) },
    ];
    moments.forEach(function (m) { m.id = P.uid("cgm"); s.cgms.push(m); });
    s.cgms.sort(function (a, b) { return b.date - a.date; });

    P.state = s;
    P.save();
    return s;
  };
})(window.Polaris = window.Polaris || {});
