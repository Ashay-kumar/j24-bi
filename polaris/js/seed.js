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

    // Identity — one person, multiple roles (Book XVII Part III example).
    s.identity = { name: "Ashay Kumar", roles: ["parent", "coach", "orgadmin"], activeWorkspace: "parent" };

    // Organizations are trusted contributors (Book XVII Part IV).
    var orgGreenValley = { id: "org_gv", name: "Green Valley School", type: "school", createdAt: daysAgo(400),
      educators: [{ id: "edu_1", name: "Ms. Rao", role: "Class Teacher", assignment: "Grade 4 · Section A" },
                  { id: "edu_2", name: "Mr. Iyer", role: "Science Teacher", assignment: "Grade 4 · Science" }] };
    var orgFootball = { id: "org_fb", name: "City Football Academy", type: "sports", createdAt: daysAgo(220),
      educators: [{ id: "edu_3", name: "Coach Diego", role: "Head Coach", assignment: "U-10 Batch" }] };
    var orgMusic = { id: "org_mu", name: "Harmony Music School", type: "music", createdAt: daysAgo(300),
      educators: [{ id: "edu_4", name: "Ms. Sera", role: "Piano Teacher", assignment: "Beginners" }] };
    s.organizations = [orgGreenValley, orgFootball, orgMusic];

    // Development Memberships: child ↔ organization (Book XVII Part VI).
    s.memberships = [
      { id: "mem_1", orgId: "org_gv", childName: "Aanya", context: "school", startYear: 2024, status: "active", educators: ["edu_1", "edu_2"] },
      { id: "mem_2", orgId: "org_fb", childName: "Aanya", context: "sports", startYear: 2025, status: "active", educators: ["edu_3"] },
      { id: "mem_3", orgId: "org_mu", childName: "Aanya", context: "creative", startYear: 2024, status: "active", educators: ["edu_4"] },
    ];

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

    // Observations from multiple independent observers, contexts, organizations
    // and dates (drives the confidence model). Each follows the v2 structure:
    // observer → competency → behaviour → context → evidence → timestamp.
    var obs = [
      { observer: "parent", context: "home", competency: "curiosity", behaviour: "Explores unfamiliar objects or ideas without being asked", text: "Took apart an old clock to see how it worked.", evidenceType: "observation", date: daysAgo(50) },
      { observer: "parent", context: "home", competency: "curiosity", behaviour: "Asks thoughtful follow-up questions", text: "Asked why the sky changes colour at sunset.", evidenceType: "observation", date: daysAgo(30) },
      { observer: "teacher", context: "school", orgId: "org_gv", competency: "curiosity", behaviour: "Asks thoughtful follow-up questions", text: "Stayed back to ask extra questions about volcanoes.", evidenceType: "observation", date: daysAgo(22) },
      { observer: "parent", context: "home", competency: "kindness", behaviour: "Acts generously", text: "Made a get-well card for a sick friend unprompted.", evidenceType: "observation", date: daysAgo(44) },
      { observer: "teacher", context: "school", orgId: "org_gv", competency: "kindness", behaviour: "Helps without being asked", text: "Helped a new classmate find their way around.", evidenceType: "observation", date: daysAgo(18) },
      { observer: "parent", context: "home", competency: "making", behaviour: "Plans then builds something", text: "Built a cardboard marble run over the weekend.", evidenceType: "observation", date: daysAgo(40) },
      { observer: "parent", context: "home", competency: "creative_thinking", behaviour: "Comes up with original ideas", text: "Invented a board game with her own rules.", evidenceType: "observation", date: daysAgo(26) },
      { observer: "music", context: "creative", orgId: "org_mu", competency: "expression", behaviour: "Tells a story with a clear order", text: "Performed a short piano piece for the class with confidence.", evidenceType: "observation", date: daysAgo(15) },
      { observer: "parent", context: "home", competency: "empathy", behaviour: "Comforts or helps a friend", text: "Comforted her younger brother when he fell.", evidenceType: "observation", date: daysAgo(20) },
      { observer: "coach", context: "sports", orgId: "org_fb", competency: "teamwork", behaviour: "Contributes to a group task", text: "Cheered on teammates during the relay.", evidenceType: "observation", date: daysAgo(12) },
      { observer: "coach", context: "sports", orgId: "org_fb", competency: "resilience", behaviour: "Tries again after a mistake", text: "Missed a goal but kept her head up and kept playing.", evidenceType: "observation", date: daysAgo(10) },
      { observer: "parent", context: "home", competency: "resilience", behaviour: "Tries again after a mistake", text: "Re-built her project after it collapsed, without giving up.", evidenceType: "observation", date: daysAgo(9) },
      { observer: "parent", context: "home", competency: "responsibility", behaviour: "Completes chores or tasks without reminders", text: "Fed and walked the dog all week without reminders.", evidenceType: "observation", date: daysAgo(6) },
      { observer: "teacher", context: "school", orgId: "org_gv", competency: "focus", behaviour: "Stays with a task to completion", text: "Completed a 30-minute reading task fully absorbed.", evidenceType: "observation", date: daysAgo(4) },
    ];
    s.observations = obs.map(function (o) { o.id = P.uid("obs"); o.private = false; return o; }).sort(function (a, b) { return b.date - a.date; });

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
