/*
 * Polaris Store
 * -------------
 * Holds the live Knowledge Graph instance data for the current family and
 * persists it to localStorage. Acts as the single source of truth for the UI.
 *
 * State shape:
 *   profile        - the child's identity (Identity Layer)
 *   observations[] - behaviours captured by observers (Evidence Layer)
 *   reflections[]  - child/parent reflections (Evidence Layer)
 *   evidence[]     - portfolio artifacts (Evidence Layer)
 *   experiences[]  - experience instances: recommended / active / completed
 *   cgms[]         - Child Growth Moments (Intelligence Layer log)
 *   settings       - lightweight preferences
 */
(function (P) {
  "use strict";

  var KEY = "polaris_state_v1";
  var listeners = [];

  P.state = null;

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }
  P.uid = uid;

  function emptyState() {
    return {
      onboarded: false,
      isDemo: false,
      profile: {
        name: "",
        age: null,
        avatar: "🌟",
        interests: [],
        personality: [],
        goals: [],
        concerns: "",
        createdAt: Date.now(),
      },
      observations: [],
      reflections: [],
      evidence: [],
      experiences: [],
      cgms: [],
      settings: { celebrateGrowth: true },
    };
  }
  P.emptyState = emptyState;

  P.load = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        P.state = JSON.parse(raw);
        // forward-compatibility: ensure all keys exist
        var base = emptyState();
        Object.keys(base).forEach(function (k) {
          if (typeof P.state[k] === "undefined") P.state[k] = base[k];
        });
      } else {
        P.state = emptyState();
      }
    } catch (e) {
      P.state = emptyState();
    }
    return P.state;
  };

  P.save = function () {
    try {
      localStorage.setItem(KEY, JSON.stringify(P.state));
    } catch (e) {
      /* storage may be unavailable (private mode); app still works in-memory */
    }
    notify();
  };

  P.reset = function () {
    P.state = emptyState();
    P.save();
  };

  function notify() {
    listeners.forEach(function (fn) {
      try { fn(P.state); } catch (e) {}
    });
  }
  P.subscribe = function (fn) { listeners.push(fn); };

  // ---- Mutations (each records into the graph then re-derives intelligence) ----

  P.addObservation = function (obs) {
    obs.id = uid("obs");
    obs.date = obs.date || Date.now();
    obs.observer = obs.observer || "parent";
    P.state.observations.unshift(obs);
    P.afterEvidenceChange("observation", obs);
    P.save();
    return obs;
  };

  P.addReflection = function (ref) {
    ref.id = uid("ref");
    ref.date = ref.date || Date.now();
    ref.by = ref.by || "child";
    P.state.reflections.unshift(ref);
    P.afterEvidenceChange("reflection", ref);
    P.save();
    return ref;
  };

  P.addEvidence = function (ev) {
    ev.id = uid("ev");
    ev.date = ev.date || Date.now();
    P.state.evidence.unshift(ev);
    P.afterEvidenceChange("evidence", ev);
    P.save();
    return ev;
  };

  P.startExperience = function (experienceId, source) {
    // avoid duplicate active instances of the same experience
    var existing = P.state.experiences.find(function (x) {
      return x.experienceId === experienceId && x.status === "active";
    });
    if (existing) return existing;
    var inst = {
      id: uid("xp"),
      experienceId: experienceId,
      status: "active",
      source: source || "manual",
      startedAt: Date.now(),
      completedAt: null,
      evidenceIds: [],
      reflectionId: null,
    };
    P.state.experiences.unshift(inst);
    P.save();
    return inst;
  };

  P.completeExperience = function (instanceId, payload) {
    var inst = P.state.experiences.find(function (x) { return x.id === instanceId; });
    if (!inst) return null;
    inst.status = "completed";
    inst.completedAt = Date.now();
    var exp = P.experienceById[inst.experienceId];

    // An experience completion is itself evidence for each target competency.
    if (exp) {
      exp.targets.forEach(function (cid) {
        var obs = P.addObservationSilent({
          observer: "experience",
          context: "experience",
          competency: cid,
          text: "Completed the experience: " + exp.title,
          evidenceType: "experience",
          sourceExperience: exp.id,
        });
        inst.evidenceIds.push(obs.id);
      });
    }

    if (payload && payload.reflection) {
      var ref = P.addReflectionSilent({
        by: "child",
        text: payload.reflection,
        experienceId: inst.experienceId,
      });
      inst.reflectionId = ref.id;
    }
    if (payload && payload.evidenceNote) {
      var ev = P.addEvidenceSilent({
        type: payload.evidenceType || "note",
        title: exp ? exp.title : "Experience evidence",
        note: payload.evidenceNote,
        dataUrl: payload.dataUrl || null,
        competency: exp ? exp.targets[0] : null,
        experienceId: inst.experienceId,
      });
      inst.evidenceIds.push(ev.id);
    }

    P.afterEvidenceChange("experience", inst);
    P.save();
    return inst;
  };

  // Silent variants used inside completeExperience so we only re-derive once.
  P.addObservationSilent = function (obs) {
    obs.id = uid("obs"); obs.date = obs.date || Date.now();
    P.state.observations.unshift(obs); return obs;
  };
  P.addReflectionSilent = function (ref) {
    ref.id = uid("ref"); ref.date = ref.date || Date.now();
    P.state.reflections.unshift(ref); return ref;
  };
  P.addEvidenceSilent = function (ev) {
    ev.id = uid("ev"); ev.date = ev.date || Date.now();
    P.state.evidence.unshift(ev); return ev;
  };

  // Hook for the engine to detect Child Growth Moments after new evidence.
  P.afterEvidenceChange = function (kind, payload) {
    if (P.engineDetectCGM) P.engineDetectCGM(kind, payload);
  };
})(window.Polaris = window.Polaris || {});
