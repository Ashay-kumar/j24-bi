/*
 * Polaris Platform Layer  (Book XVII — Platform Architecture & Governance)
 * ------------------------------------------------------------------------
 * Implements the platform "constitution": Identity, Organizations, Workspaces,
 * Development Passport and Memberships.
 *
 *   One Child. One Identity. One Development Passport. Many Contributors.
 *
 * Identity belongs to the individual. Roles belong to organizations.
 * Permissions belong to memberships. One login → many workspaces.
 */
(function (P) {
  "use strict";

  // -------------------- Workspaces (one app, many role experiences) --------------------
  // Each educator workspace records facts in its own CONTEXT and can only observe
  // the competencies appropriate to its perspective (Book 17 observer matrix).
  P.WORKSPACES = [
    {
      id: "parent", name: "Parent", short: "Parent", icon: "fa-house-user", color: "#3a6ff0",
      kind: "guardian", observer: "parent", context: "home",
      tagline: "Understand & nurture your child at home.",
    },
    {
      id: "child", name: "Child", short: "Child", icon: "fa-child-reaching", color: "#f0a93a",
      kind: "child", observer: "child", context: "self",
      tagline: "Explore adventures and reflect on your journey.",
    },
    {
      id: "teacher", name: "Teacher", short: "Teacher", icon: "fa-chalkboard-user", color: "#20c8c0",
      kind: "educator", observer: "teacher", context: "school",
      tagline: "Contribute classroom observations.",
      canObserve: ["teamwork", "focus", "expression", "leadership", "curiosity", "critical_thinking", "problem_solving"],
    },
    {
      id: "coach", name: "Sports Coach", short: "Coach", icon: "fa-stopwatch", color: "#2fa46b",
      kind: "educator", observer: "coach", context: "sports",
      tagline: "Observe resilience and teamwork under challenge.",
      canObserve: ["teamwork", "resilience", "leadership", "responsibility", "integrity", "physical_activity"],
    },
    {
      id: "music", name: "Music / Dance", short: "Arts", icon: "fa-music", color: "#9b6dff",
      kind: "educator", observer: "music", context: "creative",
      tagline: "Notice expression, creativity and confidence.",
      canObserve: ["expression", "creative_thinking", "making", "self_confidence", "focus"],
    },
    {
      id: "counselor", name: "Counselor", short: "Counselor", icon: "fa-hand-holding-heart", color: "#f08a7a",
      kind: "educator", observer: "counselor", context: "emotional",
      tagline: "Support emotional wellbeing.",
      canObserve: ["emotional_regulation", "empathy", "resilience", "learning_agility", "self_confidence"],
    },
    {
      id: "orgadmin", name: "Organization", short: "Org Admin", icon: "fa-building-columns", color: "#5b6276",
      kind: "admin", observer: "admin", context: "org",
      tagline: "Manage educators, classes and memberships.",
    },
  ];
  P.workspaceById = {};
  P.WORKSPACES.forEach(function (w) { P.workspaceById[w.id] = w; });

  P.observerLabels = {
    parent: "Parent", teacher: "Teacher", coach: "Sports Coach", music: "Music / Dance Teacher",
    counselor: "Counselor", child: "Child", family: "Family", mentor: "Mentor",
    experience: "Adventure", polaris: "Polaris", admin: "Organization",
  };

  P.contextLabels = {
    home: "Home", school: "Classroom", sports: "Sports", creative: "Creative", emotional: "Emotional",
    community: "Community", outdoor: "Outdoors", experience: "Adventure", reflection: "Reflection",
    portfolio: "Portfolio", self: "Self-reflection", org: "Organization",
  };

  // Competencies an educator workspace is allowed to observe.
  P.canObserveCompetencies = function (workspaceId) {
    var w = P.workspaceById[workspaceId];
    if (!w || !w.canObserve) return P.COMPETENCIES.slice();
    return w.canObserve.map(function (id) { return P.competencyById[id]; }).filter(Boolean);
  };

  // -------------------- Organization types --------------------
  P.ORG_TYPES = [
    { id: "school", name: "School", icon: "fa-school" },
    { id: "sports", name: "Sports Academy", icon: "fa-futbol" },
    { id: "music", name: "Music School", icon: "fa-guitar" },
    { id: "dance", name: "Dance Academy", icon: "fa-shoe-prints" },
    { id: "tuition", name: "Tuition Center", icon: "fa-book" },
    { id: "ngo", name: "NGO", icon: "fa-hand-holding-heart" },
    { id: "community", name: "Community Center", icon: "fa-people-roof" },
  ];
  P.orgTypeById = {};
  P.ORG_TYPES.forEach(function (t) { P.orgTypeById[t.id] = t; });

  // -------------------- Visibility (Book 17 / Book XVII Part IX) --------------------
  // Three layers: 1) raw observations (observer-only), 2) AI summary (shared),
  // 3) Development Passport (per role/consent).
  // A viewer sees their OWN raw notes; other observers' raw notes are surfaced
  // only as Layer-2 development summaries (no raw text), reducing bias.
  P.canSeeRaw = function (viewerObserver, obsObserver) {
    if (!viewerObserver) return true;          // guardian/passport full view
    if (viewerObserver === "guardian") return true;
    return viewerObserver === obsObserver;     // own notes only
  };
})(window.Polaris = window.Polaris || {});
