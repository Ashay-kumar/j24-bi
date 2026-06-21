/*
 * Polaris Intelligence Engine
 * ---------------------------
 * Implements the reasoning layers from the Knowledge Graph (Book 3),
 * Assessment Engine (Book 7), Recommendation Engine (Book 8) and AI Engine (Book 12).
 *
 * Core guarantees (faithful to the docs):
 *   - Evidence before inference: no insight without supporting evidence.
 *   - Explainability: every recommendation is reproducible from graph data.
 *   - Confidence grows gradually; it never jumps without evidence.
 *   - AI assists; it never labels, diagnoses or compares children.
 */
(function (P) {
  "use strict";

  var DAY = 24 * 60 * 60 * 1000;

  // Gather every piece of evidence in the graph that touches a competency.
  P.evidenceFor = function (competencyId) {
    var s = P.state;
    var items = [];
    s.observations.forEach(function (o) {
      if (o.competency === competencyId) items.push({ kind: "observation", ref: o, date: o.date, observer: o.observer, context: o.context });
    });
    s.evidence.forEach(function (e) {
      if (e.competency === competencyId) items.push({ kind: "evidence", ref: e, date: e.date, observer: "parent", context: "portfolio" });
    });
    // reflections tied to an experience that targets this competency count as evidence
    s.reflections.forEach(function (r) {
      if (!r.experienceId) return;
      var exp = P.experienceById[r.experienceId];
      if (exp && exp.targets.indexOf(competencyId) !== -1) {
        items.push({ kind: "reflection", ref: r, date: r.date, observer: r.by, context: "reflection" });
      }
    });
    items.sort(function (a, b) { return b.date - a.date; });
    return items;
  };

  /*
   * Confidence model (Book 7 Ch.8 / Book 3).
   * Confidence is influenced by: quantity, observer diversity, context diversity,
   * consistency over time, and recency. We blend these into a 0..1 score.
   */
  P.competencyState = function (competencyId) {
    var items = P.evidenceFor(competencyId);
    var count = items.length;

    if (count === 0) {
      return {
        competencyId: competencyId,
        evidenceCount: 0,
        confidence: 0,
        confidenceLevel: P.confidenceLevel(0),
        stage: P.GROWTH_STAGES[0],
        observers: [],
        contexts: [],
        lastEvidenceDate: null,
        items: items,
      };
    }

    var observers = {}, contexts = {};
    var now = Date.now();
    var recencyWeightSum = 0;
    items.forEach(function (it) {
      observers[it.observer || "parent"] = true;
      contexts[it.context || "home"] = true;
      var ageDays = Math.max(0, (now - it.date) / DAY);
      recencyWeightSum += Math.exp(-ageDays / 60); // ~2 month half-life-ish
    });
    var observerCount = Object.keys(observers).length;
    var contextCount = Object.keys(contexts).length;

    // Sub-scores, each 0..1.
    var quantityScore = 1 - Math.exp(-count / 4);                  // saturates ~8 observations
    var diversityScore = Math.min(1, (observerCount - 1) / 3);     // up to 4 distinct observers
    var contextScore = Math.min(1, (contextCount - 1) / 3);        // multiple environments
    var recencyScore = Math.min(1, recencyWeightSum / 3);          // recent + sustained
    var consistencyScore = count >= 3 ? Math.min(1, count / 6) : count / 6;

    var confidence =
      0.40 * quantityScore +
      0.20 * diversityScore +
      0.15 * contextScore +
      0.15 * recencyScore +
      0.10 * consistencyScore;
    confidence = Math.max(0, Math.min(1, confidence));

    // Growth stage derives from confidence AND evidence volume (never numeric to the user).
    var stageIdx = 0;
    if (count >= 1) stageIdx = 1;                       // Developing once first signs appear
    if (confidence >= 0.42 && count >= 3) stageIdx = 2; // Consistent
    if (confidence >= 0.68 && count >= 5) stageIdx = 3; // Advanced
    if (confidence >= 0.86 && observerCount >= 2 && count >= 7) stageIdx = 4; // Inspiring Others
    // If there is exactly the very first signal, keep it Emerging->Developing boundary friendly.
    if (count === 0) stageIdx = 0;

    return {
      competencyId: competencyId,
      evidenceCount: count,
      confidence: confidence,
      confidenceLevel: P.confidenceLevel(confidence),
      stage: P.GROWTH_STAGES[stageIdx],
      observers: Object.keys(observers),
      contexts: Object.keys(contexts),
      lastEvidenceDate: items[0].date,
      items: items,
    };
  };

  // State for every competency, with helpers for the UI.
  P.allCompetencyStates = function () {
    return P.COMPETENCIES.map(function (c) {
      var st = P.competencyState(c.id);
      st.competency = c;
      st.pillar = P.pillarById[c.pillar];
      return st;
    });
  };

  // Pillar-level summary for the Development Constellation (radar).
  P.pillarStates = function () {
    var states = P.allCompetencyStates();
    return P.PILLARS.map(function (pl) {
      var inPillar = states.filter(function (s) { return s.competency.pillar === pl.id; });
      var avg = inPillar.reduce(function (a, s) { return a + s.confidence; }, 0) / (inPillar.length || 1);
      var evidence = inPillar.reduce(function (a, s) { return a + s.evidenceCount; }, 0);
      return { pillar: pl, score: avg, evidenceCount: evidence, competencies: inPillar };
    });
  };

  /*
   * Insight generation (Explainability Engine, Book 12 Ch.11).
   * Returns a human, evidence-anchored explanation — never a label.
   */
  P.insightFor = function (competencyId) {
    var c = P.competencyById[competencyId];
    var st = P.competencyState(competencyId);
    if (st.evidenceCount === 0) {
      return {
        headline: "We're still learning about " + c.name + " together.",
        body: "We don't have evidence here yet. Try an adventure or record an observation to begin discovering this strength.",
        observed: [],
        confidenceLabel: st.confidenceLevel.label,
        stage: st.stage.label,
        suggestion: "Record an observation or start a recommended adventure.",
      };
    }
    var recent = st.items.slice(0, 3).map(function (it) {
      return it.ref.text || it.ref.note || (it.kind === "reflection" ? "Reflected on an experience" : "Captured evidence");
    });
    var observerWord = st.observers.length > 1 ? (st.observers.length + " different observers") : "one observer";
    var headline;
    if (st.stage.order >= 3) headline = c.name + " is becoming a real strength.";
    else if (st.stage.order === 2) headline = c.name + " is showing up consistently.";
    else headline = c.name + " is beginning to emerge.";

    var body = "Across " + st.evidenceCount + " piece" + (st.evidenceCount === 1 ? "" : "s") +
      " of evidence from " + observerWord + " in " + st.contexts.length + " setting" +
      (st.contexts.length === 1 ? "" : "s") + ", we're seeing signs of " + c.name.toLowerCase() + ". " +
      "Our confidence is " + st.confidenceLevel.label.toLowerCase() + " and growing.";

    var suggestion = st.confidence < 0.42
      ? "A little more evidence — especially from a new setting or observer — will deepen our understanding."
      : "Keep offering progressively richer experiences to help " + c.name + " flourish.";

    return {
      headline: headline,
      body: body,
      observed: recent,
      confidenceLabel: st.confidenceLevel.label,
      stage: st.stage.label,
      suggestion: suggestion,
    };
  };

  /*
   * Growth Opportunities (Book 8 Ch.5).
   * These are NOT weaknesses. They are competencies where a meaningful experience
   * would most help — driven by parent goals, child interests and evidence gaps.
   */
  P.growthOpportunities = function () {
    var s = P.state;
    var goalComps = {};
    (s.profile.goals || []).forEach(function (g) {
      var def = P.DISCOVERY.goals.find(function (x) { return x.id === g; });
      if (def) def.competencies.forEach(function (cid) { goalComps[cid] = true; });
    });
    var interestComps = {};
    (s.profile.interests || []).forEach(function (i) {
      var def = P.DISCOVERY.interests.find(function (x) { return x.id === i; });
      if (def) def.competencies.forEach(function (cid) { interestComps[cid] = true; });
    });

    return P.COMPETENCIES.map(function (c) {
      var st = P.competencyState(c.id);
      // Priority = how much a new experience would help.
      // Lower confidence + parent goal + child interest => higher opportunity.
      var gap = 1 - st.confidence;
      var score = gap * 0.6;
      var reasons = [];
      if (goalComps[c.id]) { score += 0.30; reasons.push("a goal you chose"); }
      if (interestComps[c.id]) { score += 0.18; reasons.push("your child's interests"); }
      if (st.evidenceCount === 0) { score += 0.10; reasons.push("a chance to discover something new"); }
      return { competency: c, state: st, score: score, reasons: reasons };
    }).sort(function (a, b) { return b.score - a.score; });
  };

  /*
   * Recommendation Engine (Book 8 / Book 12 Ch.10).
   * Need -> Evidence -> Confidence -> Personalization -> Prioritization -> Safety.
   * Produces the Next Best Experience(s), each fully explainable.
   */
  P.recommend = function (limit) {
    var s = P.state;
    var age = s.profile.age || 8;
    var opportunities = P.growthOpportunities();

    // Build per-experience scores. An experience scores by how well it serves
    // top growth opportunities, fits the child's age, and isn't repetitive.
    var completedCounts = {};
    s.experiences.forEach(function (x) {
      completedCounts[x.experienceId] = (completedCounts[x.experienceId] || 0) + (x.status === "completed" ? 1 : 0);
    });
    var activeIds = {};
    s.experiences.forEach(function (x) { if (x.status === "active") activeIds[x.experienceId] = true; });

    var oppRank = {};
    opportunities.forEach(function (o, idx) { oppRank[o.competency.id] = { rank: idx, score: o.score, reasons: o.reasons }; });

    var interestComps = {};
    (s.profile.interests || []).forEach(function (i) {
      var def = P.DISCOVERY.interests.find(function (x) { return x.id === i; });
      if (def) def.competencies.forEach(function (cid) { interestComps[cid] = true; });
    });

    var scored = P.EXPERIENCES.filter(function (exp) {
      return age >= exp.ageMin && age <= exp.ageMax && !activeIds[exp.id];
    }).map(function (exp) {
      var impact = 0;
      var servedTargets = [];
      exp.targets.forEach(function (cid) {
        var info = oppRank[cid];
        if (info) {
          impact += info.score * (1 - info.rank / P.COMPETENCIES.length);
          servedTargets.push(cid);
        }
      });
      // motivation: matches child interests
      var motivation = exp.targets.some(function (cid) { return interestComps[cid]; }) ? 0.25 : 0;
      // novelty: penalise repeats
      var novelty = -0.4 * (completedCounts[exp.id] || 0);
      // balance: gently prefer experiences covering competencies with no evidence
      var discovery = exp.targets.some(function (cid) { return P.competencyState(cid).evidenceCount === 0; }) ? 0.1 : 0;

      var total = impact + motivation + novelty + discovery;
      return { exp: exp, total: total, servedTargets: servedTargets, motivation: motivation };
    }).filter(function (r) { return r.total > 0; })
      .sort(function (a, b) { return b.total - a.total; });

    return scored.slice(0, limit || 4).map(function (r) {
      return P.explainRecommendation(r.exp, r.servedTargets, r.total);
    });
  };

  // Build the full explainability payload for a recommendation (Book 8 Ch.13).
  P.explainRecommendation = function (exp, servedTargets, score) {
    var s = P.state;
    var primary = (servedTargets && servedTargets[0]) || exp.targets[0];
    var primaryComp = P.competencyById[primary];
    var primaryState = P.competencyState(primary);

    // "What we observed" — pull real evidence if any exists, else interests/goals.
    var observed = [];
    var ev = P.evidenceFor(primary);
    if (ev.length) {
      observed = ev.slice(0, 2).map(function (it) { return it.ref.text || it.ref.note || "Captured evidence"; });
    }

    var whyNow = [];
    var goalDef = (s.profile.goals || []).map(function (g) { return P.DISCOVERY.goals.find(function (x) { return x.id === g; }); }).filter(Boolean);
    var matchedGoal = goalDef.find(function (gd) { return gd.competencies.indexOf(primary) !== -1; });
    if (matchedGoal) whyNow.push("You told us you'd love to support " + matchedGoal.label.toLowerCase() + ".");
    var interestDef = (s.profile.interests || []).map(function (i) { return P.DISCOVERY.interests.find(function (x) { return x.id === i; }); }).filter(Boolean);
    var matchedInterest = interestDef.find(function (id) { return id.competencies.indexOf(primary) !== -1; });
    if (matchedInterest) whyNow.push("It connects to your child's interest in " + matchedInterest.label.toLowerCase() + ".");
    if (primaryState.evidenceCount === 0) whyNow.push("We have no evidence here yet — this is a chance to discover something new.");
    else whyNow.push("More evidence will deepen our " + primaryState.confidenceLevel.label.toLowerCase() + " confidence in this area.");

    return {
      experience: exp,
      targets: (servedTargets && servedTargets.length ? servedTargets : exp.targets).map(function (cid) { return P.competencyById[cid]; }),
      primaryCompetency: primaryComp,
      primaryPillar: P.pillarById[primaryComp.pillar],
      confidence: primaryState.confidenceLevel,
      score: score,
      explain: {
        observed: observed,
        whyThis: exp.why,
        whyNow: whyNow,
        strengths: exp.targets.map(function (cid) { return P.competencyById[cid].name; }),
        expectedEvidence: exp.evidencePrompts,
        expectedOutcome: "Stronger " + exp.targets.map(function (cid) { return P.competencyById[cid].name.toLowerCase(); }).slice(0, 2).join(" and ") + " — with new evidence for the journey.",
      },
    };
  };

  /*
   * Child Growth Moments (Book 1).
   * A CGM occurs whenever new evidence improves our understanding.
   */
  P.engineDetectCGM = function (kind, payload) {
    var s = P.state;
    var comp = payload && (payload.competency || (payload.experienceId && P.experienceById[payload.experienceId]));
    var cid = payload && payload.competency;
    if (!cid && kind === "experience" && payload && payload.experienceId) {
      var exp = P.experienceById[payload.experienceId];
      if (exp) cid = exp.targets[0];
    }
    var text;
    if (kind === "observation") text = "New observation captured" + (cid ? " for " + P.competencyById[cid].name : "") + ".";
    else if (kind === "reflection") text = "A new reflection deepened self-awareness.";
    else if (kind === "evidence") text = "A new memory was added to the portfolio.";
    else if (kind === "experience") text = "An adventure was completed, generating fresh evidence.";
    else text = "Our understanding grew a little.";

    s.cgms.unshift({
      id: P.uid("cgm"),
      date: Date.now(),
      kind: kind,
      competency: cid || null,
      text: text,
    });
    if (s.cgms.length > 200) s.cgms.length = 200;
  };

  // Unified, chronological Growth Timeline (Book 8 Ch.16).
  P.timeline = function () {
    var s = P.state;
    var events = [];
    s.observations.forEach(function (o) {
      events.push({ date: o.date, type: "observation", icon: "fa-eye", title: o.text || "Observation",
        meta: o.competency ? P.competencyById[o.competency].name : "Observation", observer: o.observer });
    });
    s.reflections.forEach(function (r) {
      events.push({ date: r.date, type: "reflection", icon: "fa-comment", title: r.text || "Reflection",
        meta: "Reflection", observer: r.by });
    });
    s.evidence.forEach(function (e) {
      events.push({ date: e.date, type: "portfolio", icon: "fa-image", title: e.title || "Memory",
        meta: e.note || "Portfolio", observer: "parent" });
    });
    s.experiences.forEach(function (x) {
      var exp = P.experienceById[x.experienceId];
      if (!exp) return;
      if (x.status === "completed") {
        events.push({ date: x.completedAt, type: "experience", icon: "fa-flag-checkered", title: "Completed: " + exp.title,
          meta: exp.targets.map(function (c) { return P.competencyById[c].name; }).slice(0, 2).join(", "), observer: "experience" });
      } else if (x.status === "active") {
        events.push({ date: x.startedAt, type: "experience-start", icon: "fa-play", title: "Started: " + exp.title,
          meta: "Adventure in progress", observer: "experience" });
      }
    });
    s.cgms.forEach(function (c) {
      events.push({ date: c.date, type: "cgm", icon: "fa-star", title: c.text, meta: "Child Growth Moment", observer: "polaris" });
    });
    events.sort(function (a, b) { return b.date - a.date; });
    return events;
  };

  /*
   * Viewer-aware timeline (Book XVII Part IX — visibility layers).
   * A viewer sees their OWN raw observations (Layer 1). Other observers' raw
   * notes are surfaced only as Layer-2 development summaries (no raw text),
   * preserving independence and reducing bias.
   */
  P.timelineForViewer = function (viewerObserver) {
    var s = P.state;
    var events = [];
    s.observations.forEach(function (o) {
      var raw = !P.canSeeRaw || P.canSeeRaw(viewerObserver, o.observer);
      var compName = o.competency ? P.competencyById[o.competency].name : "a competency";
      if (raw) {
        events.push({ date: o.date, type: "observation", icon: "fa-eye", title: o.text || "Observation",
          meta: compName, observer: o.observer, layer: 1 });
      } else {
        // Layer-2: show that a contribution happened, not the private text.
        events.push({ date: o.date, type: "contribution", icon: "fa-circle-nodes",
          title: (P.observerLabels[o.observer] || o.observer) + " contributed an observation",
          meta: "Strengthened " + compName + " · summary only", observer: o.observer, layer: 2 });
      }
    });
    s.reflections.forEach(function (r) {
      events.push({ date: r.date, type: "reflection", icon: "fa-comment", title: r.text || "Reflection", meta: "Reflection", observer: r.by, layer: 1 });
    });
    s.evidence.forEach(function (e) {
      events.push({ date: e.date, type: "portfolio", icon: "fa-image", title: e.title || "Memory", meta: e.note || "Portfolio", observer: "parent", layer: 3 });
    });
    s.experiences.forEach(function (x) {
      var exp = P.experienceById[x.experienceId];
      if (!exp) return;
      if (x.status === "completed") {
        events.push({ date: x.completedAt, type: "experience", icon: "fa-flag-checkered", title: "Completed: " + exp.title,
          meta: exp.targets.map(function (c) { return P.competencyById[c].name; }).slice(0, 2).join(", "), observer: "experience", layer: 2 });
      } else if (x.status === "active") {
        events.push({ date: x.startedAt, type: "experience-start", icon: "fa-play", title: "Started: " + exp.title, meta: "Adventure in progress", observer: "experience", layer: 2 });
      }
    });
    s.cgms.forEach(function (c) {
      events.push({ date: c.date, type: "cgm", icon: "fa-star", title: c.text, meta: "Child Growth Moment", observer: "polaris", layer: 2 });
    });
    events.sort(function (a, b) { return b.date - a.date; });
    return events;
  };

  /*
   * AI Development Summary (Book XVII — Layer 2 / Development Passport).
   * Combines all perspectives into one explainable, cross-context summary.
   */
  P.developmentSummary = function () {
    var states = P.allCompetencyStates().filter(function (s) { return s.evidenceCount > 0; });
    var name = P.state.profile.name || "This child";

    // Distinct perspectives that have contributed.
    var observers = {};
    P.state.observations.forEach(function (o) { observers[o.observer] = (observers[o.observer] || 0) + 1; });
    var perspectiveCount = Object.keys(observers).filter(function (k) { return k !== "experience"; }).length;

    // Cross-context strengths: competencies seen in 2+ distinct environments.
    var crossContext = states.filter(function (s) {
      var ctx = s.contexts.filter(function (c) { return c !== "experience" && c !== "reflection"; });
      return ctx.length >= 2;
    }).sort(function (a, b) { return b.confidence - a.confidence; }).slice(0, 4).map(function (s) {
      var ctx = s.contexts.filter(function (c) { return c !== "experience" && c !== "reflection"; })
        .map(function (c) { return (P.contextLabels[c] || c).toLowerCase(); });
      return { competency: s.competency, contexts: ctx, stage: s.stage };
    });

    var top = states.slice().sort(function (a, b) { return b.confidence - a.confidence; }).slice(0, 3);
    var headline = top.length
      ? name + " is showing strong " + top.map(function (s) { return s.competency.name.toLowerCase(); }).join(", ") + "."
      : "We're just beginning to understand " + name + ".";

    var paragraphs = [];
    if (states.length) {
      paragraphs.push(
        "Drawing on " + P.state.observations.length + " observation" + (P.state.observations.length === 1 ? "" : "s") +
        " from " + perspectiveCount + " perspective" + (perspectiveCount === 1 ? "" : "s") +
        ", a consistent picture is emerging. The strongest signals are in " +
        top.map(function (s) { return s.competency.name }).join(", ") + "."
      );
      if (crossContext.length) {
        paragraphs.push(
          crossContext[0].competency.name + " stands out because it appears across " +
          crossContext[0].contexts.join(" and ") + " — strengths seen in multiple settings are the most reliable."
        );
      }
    } else {
      paragraphs.push("As trusted adults contribute observations, Polaris will combine them into one shared understanding here.");
    }

    return {
      headline: headline,
      paragraphs: paragraphs,
      crossContext: crossContext,
      perspectiveCount: perspectiveCount,
      observerCounts: observers,
    };
  };

  /*
   * Growth Story report (Book 8 Ch.18) — encouraging, evidence-based narrative.
   */
  P.buildReport = function () {
    var states = P.allCompetencyStates();
    var withEvidence = states.filter(function (s) { return s.evidenceCount > 0; });
    var strengths = withEvidence.slice().sort(function (a, b) { return b.confidence - a.confidence; }).slice(0, 5);
    var opportunities = P.growthOpportunities().slice(0, 4);
    var name = P.state.profile.name || "your child";

    var totalEvidence = P.state.observations.length + P.state.reflections.length + P.state.evidence.length;
    var completed = P.state.experiences.filter(function (x) { return x.status === "completed"; }).length;

    var summary;
    if (totalEvidence === 0) {
      summary = "Your journey with " + name + " is just beginning. Capture a few observations or complete an adventure, and " + name + "'s growth story will start to take shape.";
    } else {
      var topStrength = strengths[0] ? strengths[0].competency.name.toLowerCase() : "new strengths";
      summary = "Over " + totalEvidence + " observation" + (totalEvidence === 1 ? "" : "s") + " and " + completed +
        " completed adventure" + (completed === 1 ? "" : "s") + ", we're getting to know " + name + " better. " +
        "Right now, " + topStrength + " stands out — and there are wonderful opportunities ahead.";
    }

    return {
      name: name,
      summary: summary,
      strengths: strengths,
      opportunities: opportunities,
      evidenceCount: totalEvidence,
      completed: completed,
      cgms: P.state.cgms.length,
      generatedAt: Date.now(),
    };
  };

  // Weekly engagement snapshot for the Home dashboard.
  P.weeklySnapshot = function () {
    var weekAgo = Date.now() - 7 * DAY;
    var s = P.state;
    var obs = s.observations.filter(function (o) { return o.date >= weekAgo; }).length;
    var refl = s.reflections.filter(function (r) { return r.date >= weekAgo; }).length;
    var done = s.experiences.filter(function (x) { return x.status === "completed" && x.completedAt >= weekAgo; }).length;
    var cgm = s.cgms.filter(function (c) { return c.date >= weekAgo; }).length;
    return { observations: obs, reflections: refl, experiences: done, cgms: cgm };
  };
})(window.Polaris = window.Polaris || {});
