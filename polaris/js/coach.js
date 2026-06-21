/*
 * Polaris AI Coach (explainable, rule-based)
 * ------------------------------------------
 * Book 12 Ch.13 + Book 8 Ch.21: the Coach explains reasoning, never decides.
 * It answers from the Knowledge Graph so every answer is reproducible and
 * evidence-anchored. It is intentionally deterministic — no fabricated claims.
 */
(function (P) {
  "use strict";

  P.coachSuggestions = [
    "What are my child's strengths?",
    "What should we do this week?",
    "Why do you recommend that?",
    "Where can we grow next?",
    "How is the week going?",
    "Give me a conversation starter",
  ];

  function strengthsAnswer() {
    var states = P.allCompetencyStates()
      .filter(function (s) { return s.evidenceCount > 0; })
      .sort(function (a, b) { return b.confidence - a.confidence; });
    var name = P.state.profile.name || "Your child";
    if (!states.length) {
      return { text: name + " is just getting started with Polaris. Capture an observation or complete an adventure and emerging strengths will appear here — always backed by evidence.", refs: [] };
    }
    var top = states.slice(0, 3);
    var lines = top.map(function (s) {
      return "• " + s.competency.name + " — " + s.stage.label + " (" + s.confidenceLevel.label + " confidence, " + s.evidenceCount + " piece" + (s.evidenceCount === 1 ? "" : "s") + " of evidence).";
    });
    return {
      text: "Based on the evidence we've gathered, " + name + "'s emerging strengths are:\n" + lines.join("\n") +
        "\n\nRemember: these reflect what we've observed so far, not a fixed label. The more evidence, the clearer the picture.",
      refs: top.map(function (s) { return { type: "competency", id: s.competency.id, label: s.competency.name }; }),
    };
  }

  function weekAnswer() {
    var recs = P.recommend(2);
    if (!recs.length) {
      return { text: "Let's start with a gentle adventure. Head to Next Adventures to see a recommendation chosen for your child.", refs: [] };
    }
    var lines = recs.map(function (r) {
      return "• " + r.experience.title + " (" + P.DIFFICULTY[r.experience.difficulty].label + ", ~" + r.experience.durationMin + " min) — strengthens " + r.explain.strengths.slice(0, 2).join(" & ") + ".";
    });
    return {
      text: "Here's a calm plan for this week:\n" + lines.join("\n") + "\n\nPick whichever feels right — there's no pressure to do both.",
      refs: recs.map(function (r) { return { type: "experience", id: r.experience.id, label: r.experience.title }; }),
    };
  }

  function whyAnswer() {
    var recs = P.recommend(1);
    if (!recs.length) return { text: "Once we have a recommendation, I'll explain exactly why it was chosen — the observations, the competency, and the expected outcome.", refs: [] };
    var r = recs[0];
    var parts = [];
    parts.push("I recommend \"" + r.experience.title + "\" because:");
    parts.push("• It targets " + r.primaryCompetency.name + ", part of the " + r.primaryPillar.name + " pillar.");
    if (r.explain.observed.length) parts.push("• What we observed: " + r.explain.observed.join("; ") + ".");
    r.explain.whyNow.forEach(function (w) { parts.push("• " + w); });
    parts.push("• Expected outcome: " + r.explain.expectedOutcome);
    parts.push("\nYou're always the decision-maker — I only suggest.");
    return { text: parts.join("\n"), refs: [{ type: "experience", id: r.experience.id, label: r.experience.title }] };
  }

  function growAnswer() {
    var opps = P.growthOpportunities().slice(0, 3);
    var lines = opps.map(function (o) {
      var why = o.reasons.length ? " (linked to " + o.reasons.join(" and ") + ")" : "";
      return "• " + o.competency.name + why + ".";
    });
    return {
      text: "These are gentle growth opportunities — not weaknesses — where a good experience would help most:\n" + lines.join("\n") +
        "\n\nEach one is a chance to discover and strengthen something meaningful.",
      refs: opps.map(function (o) { return { type: "competency", id: o.competency.id, label: o.competency.name }; }),
    };
  }

  function snapshotAnswer() {
    var w = P.weeklySnapshot();
    var total = w.observations + w.reflections + w.experiences;
    if (total === 0) {
      return { text: "It's a quiet week so far — and that's perfectly okay. Even one small observation or a 10-minute adventure keeps the journey moving.", refs: [] };
    }
    return {
      text: "This week you've captured " + w.observations + " observation" + (w.observations === 1 ? "" : "s") +
        ", " + w.reflections + " reflection" + (w.reflections === 1 ? "" : "s") + ", and completed " + w.experiences +
        " adventure" + (w.experiences === 1 ? "" : "s") + ". That created " + w.cgms + " Child Growth Moment" +
        (w.cgms === 1 ? "" : "s") + ". Beautiful, consistent progress. 🌱",
      refs: [],
    };
  }

  function conversationStarter() {
    var opps = P.growthOpportunities();
    var comp = (opps[0] && opps[0].competency) || P.COMPETENCIES[0];
    var prompt = comp.reflectionPrompts[Math.floor(Math.random() * comp.reflectionPrompts.length)];
    var coaching = comp.coaching[Math.floor(Math.random() * comp.coaching.length)];
    return {
      text: "Try this tonight to nurture " + comp.name + ":\n• Ask: \"" + prompt + "\"\n• Tip: " + coaching,
      refs: [{ type: "competency", id: comp.id, label: comp.name }],
    };
  }

  // Very small intent router — matches keywords, deterministic.
  P.coachAnswer = function (qRaw) {
    var q = (qRaw || "").toLowerCase();
    if (/strength|good at|best|shine/.test(q)) return strengthsAnswer();
    if (/why|reason|explain/.test(q)) return whyAnswer();
    if (/week|plan|today|do next|this week/.test(q)) {
      if (/how|going|progress|doing/.test(q)) return snapshotAnswer();
      return weekAnswer();
    }
    if (/grow|improve|opportunit|work on|weak|support/.test(q)) return growAnswer();
    if (/progress|how.*going|snapshot|summary/.test(q)) return snapshotAnswer();
    if (/conversation|starter|ask|talk|dinner|prompt/.test(q)) return conversationStarter();
    if (/recommend|adventure|experience|suggest/.test(q)) return weekAnswer();

    // default: a warm, helpful catch-all
    return {
      text: "I'm your developmental guide. I can explain your child's strengths, suggest the next best adventure (and why), highlight growth opportunities, or share a conversation starter. Every answer I give is based on the evidence in your child's journey. What would you like to explore?",
      refs: [],
    };
  };
})(window.Polaris = window.Polaris || {});
