/*
 * Polaris Parent Platform — Application UI
 * ----------------------------------------
 * Implements the Information Architecture from Book 8 (Parent Platform PES):
 * Home · Development · Discovery · Next Adventures · Adventures · Timeline ·
 * Portfolio · Growth Story · AI Coach · Profile.
 *
 * Product language follows Book 1 (Discovery Journey, Next Adventure, Growth
 * Story, Growth Opportunity) and the calm, encouraging voice of Book 14.
 */
(function (P) {
  "use strict";

  var root;
  var route = "home";
  var modal = null;          // { type, id }
  var coachThread = [];
  var onb = { step: 0, draft: null };
  var deferredInstall = null; // captured beforeinstallprompt event
  var isInstalled = false;

  // -------------------- small helpers --------------------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function fmtDate(ts) {
    var d = new Date(ts), now = new Date();
    var diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return diff + " days ago";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  }
  function pillarColor(id) { return (P.pillarById[id] || {}).color || "#3a6ff0"; }
  function tint(hex, a) {
    var c = hex.replace("#", "");
    var r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  function stagePill(stage) {
    return '<span class="stage stage-' + stage.order + '">' + esc(stage.label) + "</span>";
  }
  function confDots(level) {
    var html = '<span class="conf-dots" title="' + esc(level.label) + ' confidence">';
    for (var i = 0; i < 5; i++) html += '<span class="d' + (i <= level.order ? " on" : "") + '"></span>';
    return html + "</span>";
  }
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<i class="fa-solid fa-star"></i>' + esc(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function go(r) { route = r; modal = null; window.scrollTo(0, 0); render(); }
  function openModal(type, id) { modal = { type: type, id: id }; render(); }
  function closeModal() { modal = null; render(); }

  // ==================== ONBOARDING ====================
  function onboardingView() {
    if (!onb.draft) {
      onb.draft = { name: "", age: 8, avatar: "🌟", interests: [], personality: [], goals: [], concerns: "", answers: {} };
    }
    var d = onb.draft;
    var steps = ["Welcome", "Your child", "Interests", "Personality", "Your goals", "A quick discovery", "All set"];
    var body = "";

    if (onb.step === 0) {
      body =
        '<div class="brand" style="padding-left:0"><div class="brand-star"><i class="fa-solid fa-star"></i></div>' +
        '<div><div class="brand-name">Polaris</div><div class="brand-sub">Child Development Companion</div></div></div>' +
        '<h2 class="mt16">Let\'s discover your child together.</h2>' +
        '<p class="lead">Polaris isn\'t a test or a report card. It\'s a calm companion that helps you understand, ' +
        "nurture and celebrate who your child is becoming — one experience at a time.</p>" +
        '<div class="grid g3 mb16">' +
        miniPoint("fa-eye", "Observe", "Capture everyday moments.") +
        miniPoint("fa-lightbulb", "Understand", "See evidence-based strengths.") +
        miniPoint("fa-compass", "Grow", "Get the next best adventure.") +
        "</div>" +
        '<div class="onb-foot"><button class="btn btn-ghost" data-act="load-demo"><i class="fa-solid fa-wand-magic-sparkles"></i> Explore with sample child</button>' +
        '<button class="btn btn-primary" data-act="onb-next">Begin <i class="fa-solid fa-arrow-right"></i></button></div>';
    } else if (onb.step === 1) {
      var avs = ["🌟", "🌸", "🚀", "🦊", "🐢", "🦁", "🌈", "🐬", "🦋", "🌻"];
      body =
        "<h2>Tell us about your child</h2><p class=\"lead\">This stays private and helps Polaris personalise everything.</p>" +
        '<div class="field"><label class="fld">Child\'s name</label><input type="text" id="onb-name" value="' + esc(d.name) + '" placeholder="e.g. Aanya" /></div>' +
        '<div class="field"><label class="fld">Age</label><input type="number" id="onb-age" min="3" max="18" value="' + esc(d.age) + '" /></div>' +
        '<div class="field"><label class="fld">Pick an avatar</label><div class="chip-grid">' +
        avs.map(function (a) { return '<button class="chip ' + (d.avatar === a ? "sel" : "") + '" data-act="onb-avatar" data-v="' + a + '" style="font-size:18px">' + a + "</button>"; }).join("") +
        "</div></div>" + onbFoot();
    } else if (onb.step === 2) {
      body =
        "<h2>What lights them up?</h2><p class=\"lead\">Choose a few interests. Recommendations will connect to what your child already loves.</p>" +
        '<div class="chip-grid">' +
        P.DISCOVERY.interests.map(function (i) {
          var sel = d.interests.indexOf(i.id) !== -1;
          return '<button class="chip ' + (sel ? "sel" : "") + '" data-act="onb-toggle" data-set="interests" data-v="' + i.id + '"><i class="fa-solid ' + i.icon + '"></i> ' + esc(i.label) + "</button>";
        }).join("") + "</div>" + onbFoot();
    } else if (onb.step === 3) {
      body =
        "<h2>How do they like to learn?</h2><p class=\"lead\">There are no right answers — every style is wonderful.</p>" +
        '<div class="chip-grid">' +
        P.DISCOVERY.personality.map(function (p) {
          var sel = d.personality.indexOf(p.id) !== -1;
          return '<button class="chip ' + (sel ? "sel" : "") + '" data-act="onb-toggle" data-set="personality" data-v="' + p.id + '">' + esc(p.label) + "</button>";
        }).join("") + "</div>" + onbFoot();
    } else if (onb.step === 4) {
      body =
        "<h2>What would you love to support?</h2><p class=\"lead\">Pick a few hopes. These gently guide which experiences Polaris suggests first.</p>" +
        '<div class="chip-grid">' +
        P.DISCOVERY.goals.map(function (g) {
          var sel = d.goals.indexOf(g.id) !== -1;
          return '<button class="chip ' + (sel ? "sel" : "") + '" data-act="onb-toggle" data-set="goals" data-v="' + g.id + '">' + esc(g.label) + "</button>";
        }).join("") + "</div>" + onbFoot();
    } else if (onb.step === 5) {
      body =
        "<h2>A quick discovery</h2><p class=\"lead\">A few gentle questions — these become your child's very first observations.</p>" +
        P.DISCOVERY.questions.map(function (q) {
          return '<div class="field"><label class="fld">' + esc(q.text) + "</label><div class=\"chip-grid\">" +
            q.options.map(function (o, idx) {
              var sel = d.answers[q.id] === idx;
              return '<button class="chip ' + (sel ? "sel" : "") + '" data-act="onb-answer" data-q="' + q.id + '" data-i="' + idx + '">' + esc(o.label) + "</button>";
            }).join("") + "</div></div>";
        }).join("") + onbFoot();
    } else if (onb.step === 6) {
      body =
        '<div class="center"><div style="font-size:46px">🎉</div>' +
        "<h2 class=\"mt12\">" + esc(d.name || "Your child") + "'s journey is ready</h2>" +
        '<p class="lead">We\'ve created an initial understanding. Remember — this is just the beginning. ' +
        "Every observation and adventure will help us understand " + esc(d.name || "your child") + " a little better.</p>" +
        '<button class="btn btn-primary btn-block" data-act="onb-finish">Enter Polaris <i class="fa-solid fa-arrow-right"></i></button></div>';
    }

    return (
      '<div class="onb"><div class="onb-card">' +
      '<div class="onb-steps">' + steps.map(function (_, i) { return '<div class="s ' + (i <= onb.step ? "on" : "") + '"></div>'; }).join("") + "</div>" +
      body + "</div></div>"
    );
  }
  function miniPoint(ic, t, s) {
    return '<div class="card card-pad" style="text-align:center"><div class="stat-ic" style="margin:0 auto 10px;background:var(--polaris-blue-soft);color:var(--polaris-blue)"><i class="fa-solid ' + ic + '"></i></div><div style="font-weight:800">' + t + "</div><div class=\"tiny muted\">" + s + "</div></div>";
  }
  function onbFoot() {
    return '<div class="onb-foot"><button class="btn btn-ghost" data-act="onb-back"><i class="fa-solid fa-arrow-left"></i> Back</button>' +
      '<button class="btn btn-primary" data-act="onb-next">Continue <i class="fa-solid fa-arrow-right"></i></button></div>';
  }

  // ==================== SHELL ====================
  function shell(view) {
    var p = P.state.profile;
    var nav = [
      ["home", "fa-house", "Growth Journey"],
      ["development", "fa-chart-simple", "Development"],
      ["recommend", "fa-compass", "Next Adventures"],
      ["adventures", "fa-mountain-sun", "Adventures"],
      ["discovery", "fa-wand-magic-sparkles", "Discovery"],
      ["timeline", "fa-timeline", "Growth Timeline"],
      ["portfolio", "fa-images", "Portfolio"],
      ["report", "fa-book-open", "Growth Story"],
      ["coach", "fa-comments", "AI Coach"],
    ];
    var recCount = P.recommend(4).length;
    var navHtml = nav.map(function (n) {
      var badge = n[0] === "recommend" && recCount ? '<span class="nav-badge">' + recCount + "</span>" : "";
      return '<button class="nav-item ' + (route === n[0] ? "active" : "") + '" data-act="go" data-v="' + n[0] + '"><i class="fa-solid ' + n[1] + '"></i><span>' + n[2] + "</span>" + badge + "</button>";
    }).join("");

    return (
      '<div class="app"><aside class="sidebar">' +
      '<div class="brand"><div class="brand-star"><i class="fa-solid fa-star"></i></div><div><div class="brand-name">Polaris</div><div class="brand-sub">Development Companion</div></div></div>' +
      '<div class="nav-section">Explore</div>' + navHtml +
      '<div class="sidebar-foot">' +
      (!isInstalled ? '<button class="nav-item" data-act="install" style="color:var(--polaris-blue)"><i class="fa-solid fa-circle-down"></i><span>Install app</span></button>' : "") +
      '<button class="nav-item ' + (route === "profile" ? "active" : "") + '" data-act="go" data-v="profile"><i class="fa-solid fa-gear"></i><span>Profile & Settings</span></button>' +
      '<div class="child-chip"><div class="av">' + esc(p.avatar) + '</div><div><div class="nm">' + esc(p.name) + '</div><div class="ag">Age ' + esc(p.age) + " · since " + fmtDate(p.createdAt) + "</div></div></div>" +
      "</div></aside>" +
      '<main class="main">' + view + "</main></div>" +
      (modal ? modalView() : "")
    );
  }

  // ==================== HOME ====================
  function homeView() {
    var p = P.state.profile;
    var recs = P.recommend(1);
    var rec = recs[0];
    var w = P.weeklySnapshot();
    var pillars = P.pillarStates();
    var topPillars = pillars.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 3);
    var recentRefl = P.state.reflections.slice(0, 2);
    var hour = new Date().getHours();
    var greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    var heroHtml = rec
      ? '<div class="hero"><div class="hero-eyebrow"><i class="fa-solid fa-compass"></i> Today\'s Next Adventure</div>' +
        "<h2>" + esc(rec.experience.title) + "</h2><p>" + esc(rec.explain.whyThis) + "</p>" +
        '<div class="hero-meta"><span class="pill"><i class="fa-solid fa-clock"></i> ~' + rec.experience.durationMin + " min</span>" +
        '<span class="pill"><i class="fa-solid fa-seedling"></i> ' + esc(P.DIFFICULTY[rec.experience.difficulty].label) + "</span>" +
        '<span class="pill"><i class="fa-solid fa-bullseye"></i> ' + esc(rec.explain.strengths.slice(0, 2).join(", ")) + "</span></div>" +
        '<div class="row"><button class="btn btn-primary" data-act="open-rec" data-v="' + rec.experience.id + '">See why & start</button>' +
        '<button class="btn btn-ghost" data-act="go" data-v="recommend">More adventures</button></div></div>'
      : '<div class="hero"><div class="hero-eyebrow"><i class="fa-solid fa-compass"></i> Welcome</div><h2>Let\'s capture a moment</h2>' +
        "<p>Record an observation or complete an adventure to begin " + esc(p.name) + "'s journey.</p>" +
        '<div class="row mt16"><button class="btn btn-primary" data-act="open-obs">Record an observation</button></div></div>';

    // In-progress adventures appear right here so a started activity is visible.
    var active = P.state.experiences.filter(function (x) { return x.status === "active"; });
    var activeHtml = active.length
      ? '<div class="card card-pad mt24"><div class="section-title"><i class="fa-solid fa-play"></i> Continue your adventure</div>' +
        active.map(function (x) {
          var e = P.experienceById[x.experienceId];
          if (!e) return "";
          var c = pillarColor(P.competencyById[e.targets[0]].pillar);
          return '<div class="spread" style="padding:11px 0;border-bottom:1px solid var(--line)">' +
            '<div class="row"><span class="comp-ic" style="width:34px;height:34px;margin:0;background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + e.icon + '"></i></span>' +
            '<div><div style="font-weight:800;font-size:14.5px">' + esc(e.title) + '</div><div class="tiny muted">Started ' + fmtDate(x.startedAt) + " · strengthens " + esc(P.competencyById[e.targets[0]].name) + "</div></div></div>" +
            '<button class="btn btn-green btn-sm" data-act="open-complete" data-v="' + x.id + '"><i class="fa-solid fa-check"></i> Complete &amp; reflect</button></div>';
        }).join("") + "</div>"
      : "";

    return (
      pageHead("Growth Journey", greet + ", let's see how " + esc(p.name) + " is growing 🌱",
        "Polaris turns everyday moments into a clearer understanding of your child.") +
      heroHtml +
      activeHtml +
      '<div class="section-title mt24"><i class="fa-solid fa-calendar-week"></i> This week ' +
        '<span class="muted tiny" style="font-weight:600;margin-left:6px">last 7 days · see all-time totals in your Growth Story</span></div>' +
      '<div class="grid g4">' +
        statCard("fa-eye", w.observations, "Observations", "--polaris-blue") +
        statCard("fa-flag-checkered", w.experiences, "Adventures completed", "--forest") +
        statCard("fa-comment", w.reflections, "Reflections", "--purple") +
        statCard("fa-star", w.cgms, "Growth Moments", "--gold") +
      "</div>" +
      '<div class="grid g2 mt24">' +
        // Development snapshot
        '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-chart-simple"></i> Development snapshot <span class="more" data-act="go" data-v="development">Open</span></div>' +
        topPillars.map(function (ps) { return pillarRow(ps); }).join("") + "</div>" +
        // Recent reflections
        '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-comment"></i> Recent reflections <span class="more" data-act="go" data-v="timeline">Timeline</span></div>' +
        (recentRefl.length
          ? recentRefl.map(function (r) {
              return '<div class="card-pad" style="padding:12px 0;border-bottom:1px solid var(--line)"><div style="font-size:14px">“' + esc(r.text) + "”</div><div class=\"tiny muted mt8\">" + (r.by === "child" ? "Child reflection" : "Parent note") + " · " + fmtDate(r.date) + "</div></div>";
            }).join("")
          : emptyMini("fa-comment", "No reflections yet", "They appear after adventures and journaling.")) +
        "</div>" +
      "</div>" +
      // Quick actions
      '<div class="card card-pad mt24"><div class="section-title"><i class="fa-solid fa-bolt"></i> Quick actions</div>' +
      '<div class="row" style="flex-wrap:wrap">' +
        '<button class="btn btn-soft" data-act="open-obs"><i class="fa-solid fa-eye"></i> Record observation</button>' +
        '<button class="btn btn-soft" data-act="go" data-v="adventures"><i class="fa-solid fa-mountain-sun"></i> Browse adventures</button>' +
        '<button class="btn btn-soft" data-act="open-evidence"><i class="fa-solid fa-image"></i> Add a memory</button>' +
        '<button class="btn btn-soft" data-act="go" data-v="coach"><i class="fa-solid fa-comments"></i> Ask the AI Coach</button>' +
      "</div></div>"
    );
  }

  function pillarRow(ps) {
    var c = ps.pillar.color;
    var pct = Math.round(ps.score * 100);
    return (
      '<div class="spread" style="padding:10px 0;border-bottom:1px solid var(--line);cursor:pointer" data-act="go" data-v="development">' +
      '<div class="row"><div class="comp-ic" style="width:34px;height:34px;margin:0;background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + ps.pillar.icon + '"></i></div>' +
      '<div><div style="font-weight:800;font-size:14px">' + esc(ps.pillar.name) + '</div><div class="tiny muted">' + ps.evidenceCount + " pieces of evidence</div></div></div>" +
      '<div style="width:110px"><div class="grow-bar"><i style="width:' + pct + '%;background:' + c + '"></i></div></div></div>'
    );
  }

  function statCard(ic, num, lbl, cssvar) {
    return '<div class="stat"><div class="stat-ic" style="background:' + tintVar(cssvar) + ";color:var(" + cssvar + ')"><i class="fa-solid ' + ic + '"></i></div><div class="stat-num">' + num + '</div><div class="stat-lbl">' + lbl + "</div></div>";
  }
  function tintVar(v) {
    var map = { "--polaris-blue": "var(--polaris-blue-soft)", "--forest": "var(--forest-soft)", "--purple": "var(--purple-soft)", "--gold": "var(--gold-soft)" };
    return map[v] || "var(--surface-2)";
  }

  // ==================== DEVELOPMENT ====================
  function developmentView() {
    var pillars = P.pillarStates();
    var states = P.allCompetencyStates();

    return (
      pageHead("Development", "Your child's growing constellation",
        "Every star is a competency. Brighter means more evidence — never a score, never a comparison.") +
      '<div class="grid g2">' +
        '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-star"></i> Development Constellation</div>' +
        '<div class="radar-wrap">' + radarSVG(pillars, 360) + "</div></div>" +
        '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-layer-group"></i> The ten pillars</div>' +
        pillars.map(function (ps) {
          var c = ps.pillar.color, pct = Math.round(ps.score * 100);
          return '<div class="spread" style="padding:9px 0;border-bottom:1px solid var(--line)">' +
            '<div class="row"><span class="comp-ic" style="width:30px;height:30px;margin:0;background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + ps.pillar.icon + '"></i></span>' +
            '<span style="font-weight:700;font-size:13.5px">' + esc(ps.pillar.name) + "</span></div>" +
            '<div class="row" style="width:120px"><div class="grow-bar" style="flex:1"><i style="width:' + pct + '%;background:' + c + '"></i></div></div></div>';
        }).join("") + "</div>" +
      "</div>" +
      '<div class="section-title mt24"><i class="fa-solid fa-seedling"></i> Competency Garden <span class="muted tiny" style="font-weight:600;margin-left:6px">tap any to see the evidence</span></div>' +
      '<div class="grid g4">' + states.map(compCard).join("") + "</div>"
    );
  }

  function compCard(st) {
    var c = st.pillar.color;
    var pct = Math.round(st.confidence * 100);
    return (
      '<div class="comp-card" data-act="open-comp" data-v="' + st.competency.id + '">' +
      '<div class="comp-ic" style="background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + st.competency.icon + '"></i></div>' +
      '<div class="comp-pillar" style="color:' + c + '">' + esc(st.pillar.name) + "</div>" +
      '<div class="comp-name">' + esc(st.competency.name) + "</div>" +
      '<div class="grow-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="comp-foot">' + stagePill(st.stage) + '<span class="tiny muted">' + st.evidenceCount + " ev.</span></div>" +
      "</div>"
    );
  }

  // SVG radar of the 10 pillars
  function radarSVG(pillars, size) {
    var cx = size / 2, cy = size / 2, r = size / 2 - 54;
    var n = pillars.length;
    function pt(i, radius) {
      var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)];
    }
    var rings = "";
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(pt(i, r * f).join(","));
      rings += '<polygon points="' + pts.join(" ") + '" fill="none" stroke="' + (f === 1 ? "#dcdbd4" : "#ecebe6") + '" stroke-width="1"/>';
    });
    var axes = "", labels = "";
    for (var i = 0; i < n; i++) {
      var o = pt(i, r);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + o[0] + '" y2="' + o[1] + '" stroke="#ecebe6" stroke-width="1"/>';
      var lp = pt(i, r + 26);
      var anchor = Math.abs(lp[0] - cx) < 6 ? "middle" : lp[0] > cx ? "start" : "end";
      labels += '<text x="' + lp[0] + '" y="' + lp[1] + '" font-size="9.5" font-weight="700" fill="#5b6276" text-anchor="' + anchor + '" dominant-baseline="middle">' + esc(shortName(pillars[i].pillar.name)) + "</text>";
    }
    var dataPts = [];
    for (var j = 0; j < n; j++) {
      var v = Math.max(0.06, pillars[j].score);
      dataPts.push(pt(j, r * v).join(","));
    }
    var dots = "";
    for (var k = 0; k < n; k++) {
      var vv = Math.max(0.06, pillars[k].score);
      var dp = pt(k, r * vv);
      dots += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="3.5" fill="' + pillars[k].pillar.color + '"/>';
    }
    return (
      '<svg viewBox="0 0 ' + size + " " + size + '" width="100%" style="max-width:' + size + 'px">' +
      "<defs><radialGradient id=\"rg\" cx=\"50%\" cy=\"50%\"><stop offset=\"0%\" stop-color=\"" + tint("#3a6ff0", .28) + "\"/><stop offset=\"100%\" stop-color=\"" + tint("#9b6dff", .14) + "\"/></radialGradient></defs>" +
      rings + axes +
      '<polygon points="' + dataPts.join(" ") + '" fill="url(#rg)" stroke="#3a6ff0" stroke-width="2" stroke-linejoin="round"/>' +
      dots + labels + "</svg>"
    );
  }
  function shortName(n) {
    return n.replace("Emotional Wellbeing", "Emotional").replace("Personal Effectiveness", "Effectiveness")
      .replace("Health & Physical", "Health").replace("Future Readiness", "Future").replace("Purpose & Contribution", "Purpose");
  }

  // ==================== NEXT ADVENTURES (recommendations) ====================
  function recommendView() {
    var recs = P.recommend(5);
    var body = recs.length
      ? '<div class="stack">' + recs.map(recCard).join("") + "</div>"
      : emptyState("fa-compass", "We need a little more to go on", "Record an observation or complete an adventure, and Polaris will suggest the next best experience — always with an explanation.", "Record an observation", "open-obs");
    return (
      pageHead("Next Adventures", "Carefully chosen, never random",
        "Each recommendation explains what we observed, why it fits now, and what growth to expect. You're always the decision-maker.") +
      body
    );
  }

  function recCard(r) {
    var c = r.primaryPillar.color;
    var e = r.experience;
    return (
      '<div class="rec-card">' +
      '<div class="rec-head"><div class="exp-ic" style="background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + e.icon + '"></i></div>' +
      '<div style="flex:1"><div class="comp-pillar" style="color:' + c + '">Strengthens ' + esc(r.primaryCompetency.name) + "</div>" +
      '<div class="exp-title">' + esc(e.title) + "</div>" +
      '<div class="wrap-tags mt8"><span class="pill"><i class="fa-solid fa-clock"></i> ~' + e.durationMin + ' min</span><span class="pill" style="background:' + tint(P.DIFFICULTY[e.difficulty].color, .14) + ";color:" + P.DIFFICULTY[e.difficulty].color + '">' + esc(P.DIFFICULTY[e.difficulty].label) + "</span>" +
      '<span class="pill"><i class="fa-solid fa-shield-heart"></i> ' + confDots(r.confidence) + " " + esc(r.confidence.label) + " confidence</span></div></div></div>" +
      recCardInner(r) +
      '<div class="row mt16"><button class="btn btn-primary" data-act="start-exp" data-v="' + e.id + '"><i class="fa-solid fa-play"></i> Start this adventure</button>' +
      '<button class="btn btn-ghost" data-act="open-exp" data-v="' + e.id + '">View details</button></div>' +
      "</div>"
    );
  }

  // ==================== ADVENTURES (library) ====================
  var advFilter = "all";
  function adventuresView() {
    var cats = [["all", "fa-border-all", "All"]].concat(P.EXPERIENCE_CATEGORIES.map(function (c) { return [c.id, c.icon, c.name]; }));
    var active = P.state.experiences.filter(function (x) { return x.status === "active"; });
    var list = P.EXPERIENCES.filter(function (e) { return advFilter === "all" || e.category === advFilter; });
    var age = P.state.profile.age;

    var activeHtml = active.length
      ? '<div class="card card-pad mb24"><div class="section-title"><i class="fa-solid fa-play"></i> In progress</div><div class="grid g3">' +
        active.map(function (x) { var e = P.experienceById[x.experienceId]; return e ? expCard(e, x) : ""; }).join("") + "</div></div>"
      : "";

    return (
      pageHead("Adventures", "Experiences that turn into growth",
        "Every adventure has a developmental purpose, evidence prompts and reflection questions — the Polaris Growth Loop in action.") +
      activeHtml +
      '<div class="wrap-tags mb24">' +
      cats.map(function (c) {
        return '<button class="chip ' + (advFilter === c[0] ? "sel" : "") + '" data-act="adv-filter" data-v="' + c[0] + '"><i class="fa-solid ' + c[1] + '"></i> ' + esc(c[2]) + "</button>";
      }).join("") + "</div>" +
      '<div class="grid g3">' + list.map(function (e) {
        var fit = age < e.ageMin || age > e.ageMax;
        return expCard(e, null, fit);
      }).join("") + "</div>"
    );
  }

  function expCard(e, inst, ageMismatch) {
    var cat = P.experienceCategoryById[e.category];
    var c = pillarColor(P.competencyById[e.targets[0]].pillar);
    var btns = inst
      ? '<button class="btn btn-green btn-sm" data-act="open-complete" data-v="' + inst.id + '"><i class="fa-solid fa-check"></i> Complete</button>'
      : '<button class="btn btn-soft btn-sm" data-act="open-exp" data-v="' + e.id + '">Details</button><button class="btn btn-primary btn-sm" data-act="start-exp" data-v="' + e.id + '">Start</button>';
    return (
      '<div class="exp-card"><div class="exp-top"><div class="exp-ic" style="background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + e.icon + '"></i></div>' +
      '<div><div class="comp-pillar" style="color:' + c + '">' + esc(cat ? cat.name : "") + "</div><div class=\"exp-title\">" + esc(e.title) + "</div></div></div>" +
      '<div class="exp-body"><div class="exp-why">' + esc(e.why) + "</div>" +
      '<div class="exp-tags"><span class="pill"><i class="fa-solid fa-clock"></i> ~' + e.durationMin + ' min</span><span class="pill" style="background:' + tint(P.DIFFICULTY[e.difficulty].color, .14) + ";color:" + P.DIFFICULTY[e.difficulty].color + '">' + esc(P.DIFFICULTY[e.difficulty].label) + "</span>" +
      (ageMismatch ? '<span class="pill" style="background:var(--gold-soft);color:#b3771a">Best ages ' + e.ageMin + "–" + e.ageMax + "</span>" : "") + "</div>" +
      '<div class="exp-actions">' + btns + "</div></div></div>"
    );
  }

  // ==================== DISCOVERY ====================
  function discoveryView() {
    return (
      pageHead("Discovery", "Understanding is an ongoing conversation",
        "Discovery never ends. Capture everyday behaviours and Polaris weaves them into your child's developmental understanding.") +
      '<div class="grid g2">' +
      '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-eye"></i> Record an observation</div>' +
      '<p class="muted tiny mb16">Note a real behaviour you noticed — factual, not a judgement. Example: “Explained the rules of a game to a friend.”</p>' +
      observationForm("inline") + "</div>" +
      '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-list-check"></i> Quick discovery prompts</div>' +
      '<p class="muted tiny mb16">Not sure what to look for? These prompts come straight from the Development Atlas.</p>' +
      P.growthOpportunities().slice(0, 5).map(function (o) {
        var c = pillarColor(o.competency.pillar);
        var prompt = o.competency.parentPrompts[0];
        return '<div class="spread" style="padding:11px 0;border-bottom:1px solid var(--line)"><div><div style="font-weight:700;font-size:13.5px">' + esc(prompt) + '</div><div class="tiny muted" style="color:' + c + '">' + esc(o.competency.name) + "</div></div>" +
          '<button class="btn btn-soft btn-sm" data-act="open-obs" data-v="' + o.competency.id + '">Note it</button></div>';
      }).join("") + "</div></div>"
    );
  }

  function observationForm(mode) {
    var comps = P.COMPETENCIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + " · " + esc(P.pillarById[c.pillar].name) + "</option>"; }).join("");
    var prefix = mode === "modal" ? "m" : "i";
    return (
      '<div class="field"><label class="fld">What did you notice?</label><textarea id="' + prefix + '-obs-text" placeholder="e.g. Volunteered to lead the group activity"></textarea></div>' +
      '<div class="grid g2"><div class="field"><label class="fld">Competency</label><select id="' + prefix + '-obs-comp">' + comps + "</select></div>" +
      '<div class="field"><label class="fld">Who observed?</label><select id="' + prefix + '-obs-observer"><option value="parent">Parent</option><option value="teacher">Teacher</option><option value="coach">Coach</option><option value="child">Child (self)</option><option value="family">Family member</option></select></div></div>' +
      '<div class="field"><label class="fld">Where?</label><select id="' + prefix + '-obs-context"><option value="home">Home</option><option value="school">School</option><option value="sports">Sports / activity</option><option value="community">Community</option><option value="outdoor">Outdoors</option></select></div>' +
      '<button class="btn btn-primary btn-block" data-act="save-obs" data-mode="' + mode + '"><i class="fa-solid fa-check"></i> Add to journey</button>'
    );
  }

  // ==================== TIMELINE ====================
  function timelineView() {
    var events = P.timeline();
    var colors = { observation: "#3a6ff0", reflection: "#9b6dff", portfolio: "#f0a93a", experience: "#2fa46b", "experience-start": "#5ab6e8", cgm: "#f0a93a" };
    var body = events.length
      ? '<div class="card card-pad"><div class="timeline">' + events.map(function (ev) {
          var col = colors[ev.type] || "#3a6ff0";
          return '<div class="tl-item"><div class="tl-dot" style="background:' + col + '"><i class="fa-solid ' + ev.icon + '"></i></div>' +
            '<div class="tl-title">' + esc(ev.title) + '</div><div class="tl-meta">' + esc(ev.meta) + " · " + esc(observerLabel(ev.observer)) + " · " + fmtDate(ev.date) + "</div></div>";
        }).join("") + "</div></div>"
      : emptyState("fa-timeline", "The story starts now", "As you observe, reflect and complete adventures, " + esc(P.state.profile.name) + "'s growth story will appear here.", "Record an observation", "open-obs");
    return pageHead("Growth Timeline", "The unfolding story of " + esc(P.state.profile.name),
      "A chronological record of observations, reflections, adventures and Child Growth Moments.") + body;
  }
  function observerLabel(o) {
    return { parent: "Parent", teacher: "Teacher", coach: "Coach", child: "Child", family: "Family", experience: "Adventure", polaris: "Polaris" }[o] || o;
  }

  // ==================== PORTFOLIO ====================
  function portfolioView() {
    var items = P.state.evidence;
    var body = items.length
      ? '<div class="grid g3">' + items.map(function (ev) {
          var comp = ev.competency ? P.competencyById[ev.competency] : null;
          var media = ev.dataUrl
            ? '<img src="' + ev.dataUrl + '" alt="' + esc(ev.title) + '" style="width:100%;height:160px;object-fit:cover"/>'
            : '<div style="height:120px;display:grid;place-items:center;background:var(--surface-2);font-size:30px;color:var(--ink-3)"><i class="fa-solid ' + portfolioIcon(ev.type) + '"></i></div>';
          return '<div class="exp-card">' + media + '<div class="exp-body"><div class="exp-title" style="font-size:15px">' + esc(ev.title) + "</div>" +
            (ev.note ? '<div class="exp-why">' + esc(ev.note) + "</div>" : "") +
            '<div class="wrap-tags mt8">' + (comp ? '<span class="pill">' + esc(comp.name) + "</span>" : "") + '<span class="pill">' + fmtDate(ev.date) + "</span></div></div></div>";
        }).join("") + "</div>"
      : emptyState("fa-images", "Your portfolio is empty", "Capture photos, projects and proud moments. They become a lifelong record of growth.", "Add a memory", "open-evidence");
    return pageHead("Portfolio", "A lifelong record of meaningful moments",
      "Photos, projects, certificates and reflections — the evidence behind every insight.") +
      '<div class="spread mb16"><div></div><button class="btn btn-primary" data-act="open-evidence"><i class="fa-solid fa-plus"></i> Add a memory</button></div>' + body;
  }
  function portfolioIcon(t) { return { project: "fa-cube", note: "fa-note-sticky", photo: "fa-image", video: "fa-video", certificate: "fa-award", voice: "fa-microphone" }[t] || "fa-file"; }

  // ==================== GROWTH STORY (report) ====================
  function reportView() {
    var rep = P.buildReport();
    return (
      pageHead("Growth Story", esc(rep.name) + "'s development, in plain language",
        "An encouraging, evidence-based summary — written to be understood without any expertise.") +
      '<div class="card card-pad"><div class="row mb16"><div class="brand-star" style="background:linear-gradient(135deg,var(--forest),var(--gold))"><i class="fa-solid fa-book-open"></i></div>' +
      '<div><div style="font-weight:800;font-size:17px">Summary</div><div class="tiny muted">Generated ' + fmtDate(rep.generatedAt) + " · from " + rep.evidenceCount + " pieces of evidence</div></div></div>" +
      '<p style="font-size:15.5px;line-height:1.65">' + esc(rep.summary) + "</p></div>" +
      '<div class="grid g2 mt24">' +
      '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-star" style="color:var(--gold)"></i> Emerging strengths</div>' +
      (rep.strengths.length ? rep.strengths.map(function (s) {
        var c = s.pillar.color;
        return '<div class="spread" style="padding:10px 0;border-bottom:1px solid var(--line);cursor:pointer" data-act="open-comp" data-v="' + s.competency.id + '">' +
          '<div class="row"><span class="comp-ic" style="width:30px;height:30px;margin:0;background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + s.competency.icon + '"></i></span><div><div style="font-weight:700;font-size:13.5px">' + esc(s.competency.name) + "</div><div class=\"tiny muted\">" + esc(s.stage.label) + "</div></div></div>" + confDots(s.confidenceLevel) + "</div>";
      }).join("") : emptyMini("fa-star", "Not yet", "Capture evidence to reveal strengths.")) + "</div>" +
      '<div class="card card-pad"><div class="section-title"><i class="fa-solid fa-seedling" style="color:var(--forest)"></i> Growth opportunities</div>' +
      '<p class="tiny muted mb16">These are invitations, not weaknesses — areas where a good experience would help most.</p>' +
      rep.opportunities.map(function (o) {
        var c = o.competency.pillar ? pillarColor(o.competency.pillar) : "#3a6ff0";
        return '<div class="spread" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row"><span class="comp-ic" style="width:30px;height:30px;margin:0;background:' + tint(c, .12) + ";color:" + c + '"><i class="fa-solid ' + o.competency.icon + '"></i></span><span style="font-weight:700;font-size:13.5px">' + esc(o.competency.name) + "</span></div>" +
          '<button class="btn btn-soft btn-sm" data-act="open-comp" data-v="' + o.competency.id + '">Explore</button></div>';
      }).join("") + "</div></div>" +
      '<div class="card card-pad mt24"><div class="section-title center" style="justify-content:center"><i class="fa-solid fa-infinity"></i> All time, since the journey began</div>' +
      '<div class="row" style="justify-content:center;gap:30px">' +
      reportStat(rep.evidenceCount, "Evidence pieces") + reportStat(rep.completed, "Adventures") + reportStat(rep.cgms, "Growth Moments") +
      "</div></div>"
    );
  }
  function reportStat(n, l) { return '<div class="center"><div class="stat-num" style="color:var(--polaris-blue)">' + n + '</div><div class="stat-lbl">' + l + "</div></div>"; }

  // ==================== AI COACH ====================
  function coachView() {
    if (!coachThread.length) {
      coachThread.push({ role: "coach", text: "Hello! I'm your Polaris developmental guide. I explain what we're seeing in " + (P.state.profile.name || "your child") + "'s journey — always based on real evidence. Ask me anything, or tap a suggestion below.", refs: [] });
    }
    var thread = coachThread.map(function (m) {
      var refs = m.refs && m.refs.length
        ? '<div class="coach-refs">' + m.refs.map(function (r) {
            var act = r.type === "experience" ? "open-exp" : "open-comp";
            return '<button class="pill" data-act="' + act + '" data-v="' + r.id + '"><i class="fa-solid fa-arrow-up-right-from-square"></i> ' + esc(r.label) + "</button>";
          }).join("") + "</div>"
        : "";
      return '<div class="bubble ' + (m.role === "me" ? "me" : "coach") + '">' + esc(m.text) + refs + "</div>";
    }).join("");

    return (
      pageHead("AI Coach", "Understanding, explained",
        "I assist — you decide. I never label, diagnose or compare. Every answer is grounded in your child's evidence.") +
      '<div class="card card-pad"><div class="coach-thread" id="coach-thread">' + thread + "</div>" +
      '<div class="wrap-tags mt16">' + P.coachSuggestions.map(function (s) { return '<button class="chip" data-act="coach-ask" data-v="' + esc(s) + '">' + esc(s) + "</button>"; }).join("") + "</div>" +
      '<div class="coach-input"><input type="text" id="coach-q" placeholder="Ask about strengths, plans, or why something is recommended…" /><button class="btn btn-primary" data-act="coach-send"><i class="fa-solid fa-paper-plane"></i></button></div></div>'
    );
  }

  // ==================== PROFILE / SETTINGS ====================
  function profileView() {
    var p = P.state.profile;
    var interests = (p.interests || []).map(function (i) { var d = P.DISCOVERY.interests.find(function (x) { return x.id === i; }); return d ? '<span class="pill"><i class="fa-solid ' + d.icon + '"></i> ' + esc(d.label) + "</span>" : ""; }).join("");
    var goals = (p.goals || []).map(function (g) { var d = P.DISCOVERY.goals.find(function (x) { return x.id === g; }); return d ? '<span class="pill">' + esc(d.label) + "</span>" : ""; }).join("");
    var personality = (p.personality || []).map(function (pp) { var d = P.DISCOVERY.personality.find(function (x) { return x.id === pp; }); return d ? '<span class="pill">' + esc(d.label) + "</span>" : ""; }).join("");

    return (
      pageHead("Profile & Settings", esc(p.name) + "'s profile",
        "The living identity of the developmental journey. You retain full control of your family's data.") +
      '<div class="card card-pad"><div class="row mb16"><div class="child-chip"><div class="av" style="width:54px;height:54px;font-size:28px">' + esc(p.avatar) + '</div><div><div style="font-weight:800;font-size:20px">' + esc(p.name) + '</div><div class="muted">Age ' + esc(p.age) + " · with Polaris since " + fmtDate(p.createdAt) + "</div></div></div></div>" +
      (p.concerns ? '<div class="why-block"><h5>What you shared</h5><div style="font-size:14px">' + esc(p.concerns) + "</div></div>" : "") +
      '<div class="mt16"><div class="fld">Interests</div><div class="wrap-tags">' + (interests || '<span class="muted tiny">None yet</span>') + "</div></div>" +
      '<div class="mt16"><div class="fld">Learning style</div><div class="wrap-tags">' + (personality || '<span class="muted tiny">None yet</span>') + "</div></div>" +
      '<div class="mt16"><div class="fld">Your goals</div><div class="wrap-tags">' + (goals || '<span class="muted tiny">None yet</span>') + "</div></div></div>" +
      (isInstalled
        ? '<div class="card card-pad mt24"><div class="row"><span class="comp-ic" style="width:38px;height:38px;margin:0;background:var(--forest-soft);color:var(--forest)"><i class="fa-solid fa-circle-check"></i></span><div><div style="font-weight:800">Installed as an app</div><div class="tiny muted">You\'re running Polaris in app mode. It works offline too.</div></div></div></div>'
        : '<div class="card card-pad mt24"><div class="section-title"><i class="fa-solid fa-mobile-screen"></i> Install as an app</div>' +
          '<p class="muted tiny mb16">Add Polaris to your home screen for a full-screen, offline-ready experience with its own icon \u2014 no app store needed.</p>' +
          '<button class="btn btn-primary" data-act="install"><i class="fa-solid fa-download"></i> Install Polaris</button></div>') +
      '<div class="card card-pad mt24"><div class="section-title"><i class="fa-solid fa-database"></i> Your data</div>' +
      '<p class="muted tiny mb16">Polaris keeps everything privately in your browser. Nothing leaves this device.</p>' +
      '<div class="row" style="flex-wrap:wrap"><button class="btn btn-ghost" data-act="export"><i class="fa-solid fa-download"></i> Export data (JSON)</button>' +
      '<button class="btn btn-ghost" data-act="reload-demo"><i class="fa-solid fa-wand-magic-sparkles"></i> Reload sample child</button>' +
      '<button class="btn btn-ghost" data-act="reset" style="color:var(--coral)"><i class="fa-solid fa-rotate-left"></i> Start fresh</button></div></div>'
    );
  }

  // ==================== MODALS ====================
  function modalView() {
    var inner = "";
    if (modal.type === "comp") inner = compModal(modal.id);
    else if (modal.type === "exp") inner = expModal(modal.id);
    else if (modal.type === "complete") inner = completeModal(modal.id);
    else if (modal.type === "obs") inner = obsModal();
    else if (modal.type === "evidence") inner = evidenceModal();
    else if (modal.type === "rec") inner = recModal(modal.id);
    else if (modal.type === "install") inner = installModal();
    return '<div class="scrim" data-act="scrim"><div class="modal" data-stop="1">' + inner + "</div></div>";
  }
  function modalHead(title, sub) {
    return '<div class="modal-head"><div><div class="page-eyebrow">' + esc(sub || "Polaris") + '</div><div style="font-size:21px;font-weight:800;letter-spacing:-.4px">' + esc(title) + '</div></div><button class="x-btn" data-act="close"><i class="fa-solid fa-xmark"></i></button></div>';
  }

  function compModal(id) {
    var c = P.competencyById[id];
    var st = P.competencyState(id);
    var insight = P.insightFor(id);
    var col = pillarColor(c.pillar);
    var recsForComp = P.EXPERIENCES.filter(function (e) { return e.targets.indexOf(id) !== -1 && P.state.profile.age >= e.ageMin && P.state.profile.age <= e.ageMax; }).slice(0, 3);

    return (
      modalHead(c.name, P.pillarById[c.pillar].name + " pillar") +
      '<div class="modal-body">' +
      '<div class="row mb16">' + stagePill(st.stage) + confDots(st.confidenceLevel) + '<span class="tiny muted">' + esc(st.confidenceLevel.label) + " confidence · " + st.evidenceCount + " pieces of evidence</span></div>" +
      '<p style="font-size:14.5px">' + esc(c.definition) + "</p>" +
      '<div class="why-block mt16"><h5><i class="fa-solid fa-lightbulb"></i> ' + esc(insight.headline) + '</h5><div style="font-size:14px">' + esc(insight.body) + "</div>" +
      (insight.observed.length ? '<div class="mt12"><div class="tiny muted mb8">What we observed:</div>' + insight.observed.map(function (o) { return '<div style="font-size:13.5px">• ' + esc(o) + "</div>"; }).join("") + "</div>" : "") +
      '<div class="mt12" style="font-size:13.5px;color:' + col + '"><i class="fa-solid fa-arrow-right"></i> ' + esc(insight.suggestion) + "</div></div>" +
      '<div class="mt16"><div class="fld">Observable behaviours (from the Atlas)</div>' + c.behaviors.map(function (b) { return '<div style="font-size:13.5px;padding:4px 0"><i class="fa-solid fa-circle-check" style="color:' + col + ';font-size:11px"></i> ' + esc(b) + "</div>"; }).join("") + "</div>" +
      '<div class="mt16"><div class="fld">Coaching ideas for home</div>' + c.coaching.map(function (b) { return '<div style="font-size:13.5px;padding:4px 0"><i class="fa-solid fa-heart" style="color:var(--coral);font-size:11px"></i> ' + esc(b) + "</div>"; }).join("") + "</div>" +
      (recsForComp.length ? '<div class="mt16"><div class="fld">Adventures that strengthen this</div><div class="wrap-tags">' + recsForComp.map(function (e) { return '<button class="chip" data-act="open-exp" data-v="' + e.id + '"><i class="fa-solid ' + e.icon + '"></i> ' + esc(e.title) + "</button>"; }).join("") + "</div></div>" : "") +
      '<button class="btn btn-primary btn-block mt24" data-act="open-obs" data-v="' + id + '"><i class="fa-solid fa-eye"></i> Record an observation for ' + esc(c.name) + "</button></div>"
    );
  }

  function expModal(id) {
    var e = P.experienceById[id];
    var cat = P.experienceCategoryById[e.category];
    var inst = P.state.experiences.find(function (x) { return x.experienceId === id && x.status === "active"; });
    var col = pillarColor(P.competencyById[e.targets[0]].pillar);
    return (
      modalHead(e.title, cat ? cat.name : "Adventure") +
      '<div class="modal-body">' +
      '<div class="wrap-tags mb16"><span class="pill"><i class="fa-solid fa-clock"></i> ~' + e.durationMin + ' min</span><span class="pill" style="background:' + tint(P.DIFFICULTY[e.difficulty].color, .14) + ";color:" + P.DIFFICULTY[e.difficulty].color + '">' + esc(P.DIFFICULTY[e.difficulty].label) + "</span><span class=\"pill\">Ages " + e.ageMin + "–" + e.ageMax + "</span></div>" +
      '<div class="why-block"><h5><i class="fa-solid fa-circle-question"></i> Why it matters</h5><div style="font-size:14px">' + esc(e.why) + "</div></div>" +
      '<div class="mt16"><div class="fld">Strengthens</div><div class="wrap-tags">' + e.targets.map(function (cid) { var c = P.competencyById[cid]; return '<button class="chip" data-act="open-comp" data-v="' + cid + '"><i class="fa-solid ' + c.icon + '"></i> ' + esc(c.name) + "</button>"; }).join("") + "</div></div>" +
      '<div class="mt16"><div class="fld">What to do</div><ol style="padding-left:18px;font-size:14px;line-height:1.7">' + e.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div>" +
      '<div class="grid g2 mt16"><div><div class="fld"><i class="fa-solid fa-camera"></i> Evidence to capture</div>' + e.evidencePrompts.map(function (s) { return '<div style="font-size:13px;padding:3px 0" class="muted">• ' + esc(s) + "</div>"; }).join("") + "</div>" +
      '<div><div class="fld"><i class="fa-solid fa-comment"></i> Reflection prompts</div>' + e.reflectionPrompts.map(function (s) { return '<div style="font-size:13px;padding:3px 0" class="muted">• ' + esc(s) + "</div>"; }).join("") + "</div></div>" +
      (inst
        ? '<button class="btn btn-green btn-block mt24" data-act="open-complete" data-v="' + inst.id + '"><i class="fa-solid fa-check"></i> Mark complete & reflect</button>'
        : '<button class="btn btn-primary btn-block mt24" data-act="start-exp" data-v="' + e.id + '"><i class="fa-solid fa-play"></i> Start this adventure</button>') +
      "</div>"
    );
  }

  function completeModal(instId) {
    var inst = P.state.experiences.find(function (x) { return x.id === instId; });
    if (!inst) return modalHead("Adventure", "") + '<div class="modal-body">This adventure is no longer active.</div>';
    var e = P.experienceById[inst.experienceId];
    var rp = e.reflectionPrompts[0];
    return (
      modalHead("Complete: " + e.title, "Reflect & capture evidence") +
      '<div class="modal-body">' +
      '<p class="muted tiny mb16">Reflection turns experience into learning. Capture what happened — there are no wrong answers.</p>' +
      '<div class="field"><label class="fld">Child\'s reflection — “' + esc(rp) + '”</label><textarea id="cmp-reflection" placeholder="In your child\'s words…"></textarea></div>' +
      '<div class="field"><label class="fld">A note or memory (optional)</label><input type="text" id="cmp-note" placeholder="e.g. Built a working marble run" /></div>' +
      '<div class="field"><label class="fld">Add a photo (optional)</label><input type="file" id="cmp-photo" accept="image/*" /></div>' +
      '<button class="btn btn-green btn-block" data-act="finish-complete" data-v="' + instId + '"><i class="fa-solid fa-star"></i> Celebrate this growth</button></div>'
    );
  }

  function obsModal() {
    return modalHead("Record an observation", "Discovery") + '<div class="modal-body">' + observationForm("modal") + "</div>";
  }

  function evidenceModal() {
    var comps = '<option value="">— optional —</option>' + P.COMPETENCIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("");
    return (
      modalHead("Add a memory", "Portfolio") +
      '<div class="modal-body">' +
      '<div class="field"><label class="fld">Title</label><input type="text" id="ev-title" placeholder="e.g. First science project" /></div>' +
      '<div class="field"><label class="fld">Note</label><textarea id="ev-note" placeholder="What makes this moment special?"></textarea></div>' +
      '<div class="grid g2"><div class="field"><label class="fld">Type</label><select id="ev-type"><option value="photo">Photo</option><option value="project">Project</option><option value="certificate">Certificate</option><option value="note">Note</option><option value="video">Video</option></select></div>' +
      '<div class="field"><label class="fld">Related competency</label><select id="ev-comp">' + comps + "</select></div></div>" +
      '<div class="field"><label class="fld">Photo (optional)</label><input type="file" id="ev-photo" accept="image/*" /></div>' +
      '<button class="btn btn-primary btn-block" data-act="save-evidence"><i class="fa-solid fa-plus"></i> Add to portfolio</button></div>'
    );
  }

  function recModal(expId) {
    var recs = P.recommend(6);
    var r = recs.find(function (x) { return x.experience.id === expId; });
    if (!r) { return expModal(expId); }
    return modalHead("Why this adventure?", "Next Adventure · explainable") +
      '<div class="modal-body">' + recCardInner(r) +
      '<button class="btn btn-primary btn-block mt16" data-act="start-exp" data-v="' + expId + '"><i class="fa-solid fa-play"></i> Start this adventure</button></div>';
  }
  function recCardInner(r) {
    return (
      '<div class="why-block"><h5><i class="fa-solid fa-circle-question"></i> Why this, why now</h5><ul class="why-list">' +
      (r.explain.observed.length ? r.explain.observed.map(function (o) { return '<li><i class="fa-solid fa-eye"></i> Observed: ' + esc(o) + "</li>"; }).join("") : "") +
      r.explain.whyNow.map(function (w) { return '<li><i class="fa-solid fa-check"></i> ' + esc(w) + "</li>"; }).join("") +
      '<li><i class="fa-solid fa-bullseye"></i> Strengthens: ' + esc(r.explain.strengths.join(", ")) + "</li>" +
      '<li><i class="fa-solid fa-seedling"></i> Expected outcome: ' + esc(r.explain.expectedOutcome) + "</li></ul></div>"
    );
  }

  function installModal() {
    var ios = isiOS();
    var steps = ios
      ? ['Tap the <b>Share</b> button <i class="fa-solid fa-arrow-up-from-bracket"></i> in Safari\u2019s toolbar.',
         'Scroll down and tap <b>Add to Home Screen</b> <i class="fa-solid fa-square-plus"></i>.',
         "Tap <b>Add</b> \u2014 Polaris will appear on your home screen like any app."]
      : ['Open the browser menu <i class="fa-solid fa-ellipsis-vertical"></i> (top-right).',
         'Choose <b>Install app</b> / <b>Add to Home screen</b>.',
         "Confirm \u2014 Polaris opens full-screen, works offline, and gets its own icon."];
    return (
      modalHead("Install Polaris", "Use it like a real app") +
      '<div class="modal-body">' +
      '<p class="muted mb16">Polaris can be installed on your ' + (ios ? "iPhone or iPad" : "phone or computer") +
      " \u2014 full-screen, offline-ready, with its own icon. No app store needed.</p>" +
      '<ol style="padding-left:18px;font-size:14.5px;line-height:1.9">' +
      steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
      (ios ? "" : '<button class="btn btn-primary btn-block mt16" data-act="install"><i class="fa-solid fa-download"></i> Try install now</button>') +
      "</div>"
    );
  }

  // ==================== SHARED UI BITS ====================
  function pageHead(title, sub, desc) {
    return '<div class="page-head"><div class="page-eyebrow">Polaris</div><div class="page-title">' + esc(title) + "</div>" +
      (sub ? '<div class="page-sub">' + esc(sub) + "</div>" : "") +
      (desc ? '<div class="tiny muted mt8">' + esc(desc) + "</div>" : "") + "</div>";
  }
  function emptyState(ic, h, p, btnLabel, btnAct) {
    return '<div class="card card-pad"><div class="empty"><div class="e-ic"><i class="fa-solid ' + ic + '"></i></div><h4>' + esc(h) + "</h4><p>" + esc(p) + "</p>" +
      (btnLabel ? '<button class="btn btn-primary mt16" data-act="' + btnAct + '">' + esc(btnLabel) + "</button>" : "") + "</div></div>";
  }
  function emptyMini(ic, h, p) {
    return '<div class="empty" style="padding:24px 12px"><div class="e-ic" style="font-size:24px"><i class="fa-solid ' + ic + '"></i></div><div style="font-weight:700">' + esc(h) + '</div><div class="tiny">' + esc(p) + "</div></div>";
  }

  // ==================== RENDER ====================
  function viewFor() {
    switch (route) {
      case "home": return homeView();
      case "development": return developmentView();
      case "recommend": return recommendView();
      case "adventures": return adventuresView();
      case "discovery": return discoveryView();
      case "timeline": return timelineView();
      case "portfolio": return portfolioView();
      case "report": return reportView();
      case "coach": return coachView();
      case "profile": return profileView();
      default: return homeView();
    }
  }

  function render() {
    if (!P.state.onboarded) {
      root.innerHTML = onboardingView();
    } else {
      root.innerHTML = shell(viewFor());
      // autoscroll coach thread to bottom
      var ct = document.getElementById("coach-thread");
      if (ct) ct.scrollTop = ct.scrollHeight;
      // preselect competency in the observation modal when opened from a competency
      if (modal && modal.type === "obs" && modal.id) {
        var sel = document.getElementById("m-obs-comp");
        if (sel) sel.value = modal.id;
      }
    }
  }

  // ==================== ACTIONS ====================
  function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }

  function handle(act, v, target) {
    switch (act) {
      case "go": go(v); break;
      case "close": closeModal(); break;
      case "scrim": closeModal(); break;

      // onboarding
      case "onb-next": onbNext(); break;
      case "onb-back": onb.step = Math.max(0, onb.step - 1); render(); break;
      case "onb-avatar": onb.draft.avatar = v; render(); break;
      case "onb-toggle": toggleArr(onb.draft[target.getAttribute("data-set")], v); render(); break;
      case "onb-answer": onb.draft.answers[target.getAttribute("data-q")] = parseInt(target.getAttribute("data-i"), 10); render(); break;
      case "onb-finish": finishOnboarding(); break;
      case "load-demo": P.loadDemo(); route = "home"; render(); toast("Sample child loaded — meet Aanya!"); break;

      // observations
      case "open-obs": openModal("obs", v || null); break;
      case "save-obs": saveObs(target.getAttribute("data-mode")); break;

      // evidence
      case "open-evidence": openModal("evidence"); break;
      case "save-evidence": saveEvidence(); break;

      // competency / experience modals
      case "open-comp": openModal("comp", v); break;
      case "open-exp": openModal("exp", v); break;
      case "open-rec": openModal("rec", v); break;
      case "open-complete": openModal("complete", v); break;
      case "finish-complete": finishComplete(v); break;
      case "start-exp": startExp(v); break;

      // adventures filter
      case "adv-filter": advFilter = v; render(); break;

      // coach
      case "coach-ask": coachAsk(v); break;
      case "coach-send": coachAsk(val("coach-q")); break;

      // install
      case "install": doInstall(); break;

      // settings
      case "export": exportData(); break;
      case "reload-demo": P.loadDemo(); route = "home"; render(); toast("Sample child reloaded"); break;
      case "reset": if (confirm("Start fresh? This clears all data on this device.")) { P.reset(); onb = { step: 0, draft: null }; route = "home"; render(); } break;
    }
  }

  function toggleArr(arr, v) { var i = arr.indexOf(v); if (i === -1) arr.push(v); else arr.splice(i, 1); }

  function onbNext() {
    // capture step inputs
    if (onb.step === 1) {
      onb.draft.name = val("onb-name").trim() || onb.draft.name;
      var a = parseInt(val("onb-age"), 10); if (!isNaN(a)) onb.draft.age = Math.max(3, Math.min(18, a));
      if (!onb.draft.name) { toast("Please add your child's name"); return; }
    }
    onb.step = Math.min(6, onb.step + 1);
    render();
  }

  function finishOnboarding() {
    var d = onb.draft;
    var s = P.emptyState();
    s.onboarded = true;
    s.profile.name = d.name || "Your child";
    s.profile.age = d.age || 8;
    s.profile.avatar = d.avatar;
    s.profile.interests = d.interests;
    s.profile.personality = d.personality;
    s.profile.goals = d.goals;
    s.profile.createdAt = Date.now();
    P.state = s;
    // seed discovery answers as initial observations
    P.DISCOVERY.questions.forEach(function (q) {
      var idx = d.answers[q.id];
      if (typeof idx === "number" && q.options[idx]) {
        var o = q.options[idx];
        P.state.observations.unshift({ id: P.uid("obs"), observer: "parent", context: "home", competency: o.competency, text: o.note, evidenceType: "discovery", date: Date.now() });
      }
    });
    P.save();
    route = "home"; render();
    toast("Welcome to Polaris! 🌟");
  }

  function saveObs(mode) {
    var prefix = mode === "modal" ? "m" : "i";
    var text = val(prefix + "-obs-text").trim();
    if (!text) { toast("Please describe what you noticed"); return; }
    P.addObservation({
      observer: val(prefix + "-obs-observer") || "parent",
      context: val(prefix + "-obs-context") || "home",
      competency: val(prefix + "-obs-comp"),
      text: text,
      evidenceType: "observation",
    });
    if (mode === "modal") closeModal(); else render();
    toast("Observation added to the journey 🌱");
  }

  function saveEvidence() {
    var title = val("ev-title").trim();
    if (!title) { toast("Please add a title"); return; }
    var fileEl = document.getElementById("ev-photo");
    var finish = function (dataUrl) {
      P.addEvidence({ type: val("ev-type"), title: title, note: val("ev-note").trim(), competency: val("ev-comp") || null, dataUrl: dataUrl || null });
      closeModal(); toast("Memory added to portfolio");
    };
    readFile(fileEl, finish);
  }

  function finishComplete(instId) {
    var fileEl = document.getElementById("cmp-photo");
    var reflection = val("cmp-reflection").trim();
    var note = val("cmp-note").trim();
    var done = function (dataUrl) {
      P.completeExperience(instId, { reflection: reflection, evidenceNote: note, evidenceType: "photo", dataUrl: dataUrl || null });
      closeModal(); route = "home"; render();
      toast("Adventure complete — that's a Child Growth Moment! ⭐");
    };
    readFile(fileEl, done);
  }

  function readFile(fileEl, cb) {
    if (fileEl && fileEl.files && fileEl.files[0]) {
      var f = fileEl.files[0];
      if (f.size > 2_500_000) { toast("Image too large — saved without photo"); cb(null); return; }
      var reader = new FileReader();
      reader.onload = function (e) { cb(e.target.result); };
      reader.onerror = function () { cb(null); };
      reader.readAsDataURL(f);
    } else cb(null);
  }

  function startExp(id) {
    P.startExperience(id, "manual");
    closeModal(); route = "home"; render();
    toast("Adventure started — find it under “Continue your adventure”.");
  }

  function coachAsk(q) {
    q = (q || "").trim();
    if (!q) return;
    coachThread.push({ role: "me", text: q, refs: [] });
    var ans = P.coachAnswer(q);
    coachThread.push({ role: "coach", text: ans.text, refs: ans.refs });
    render();
  }

  function doInstall() {
    if (deferredInstall) {
      deferredInstall.prompt();
      var p = deferredInstall.userChoice;
      if (p && p.then) p.then(function () { deferredInstall = null; render(); });
      else { deferredInstall = null; render(); }
    } else {
      // iOS Safari (and browsers without the prompt) need manual instructions.
      openModal("install");
    }
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(P.state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "polaris-" + (P.state.profile.name || "journey").toLowerCase() + ".json";
    a.click(); URL.revokeObjectURL(url);
    toast("Data exported");
  }

  // ==================== EVENT WIRING ====================
  function onClick(e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    e.preventDefault();
    // stop scrim-close when clicking inside modal
    if (t.getAttribute("data-act") === "scrim" && e.target.closest("[data-stop]")) return;
    handle(t.getAttribute("data-act"), t.getAttribute("data-v"), t);
  }
  function onKey(e) {
    if (e.key === "Escape" && modal) closeModal();
    if (e.key === "Enter" && document.activeElement && document.activeElement.id === "coach-q") {
      coachAsk(document.activeElement.value);
    }
  }

  // ==================== INIT ====================
  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  }
  function isiOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
  }

  function init() {
    root = document.getElementById("root");
    P.load();
    isInstalled = isStandalone();

    // PWA install: capture the prompt so we can offer an in-app Install button.
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredInstall = e;
      render();
    });
    window.addEventListener("appinstalled", function () {
      deferredInstall = null; isInstalled = true; render();
      toast("Polaris is installed 🎉");
    });

    // Deep links from manifest shortcuts (?route=… / ?action=observe).
    try {
      var params = new URLSearchParams(window.location.search);
      var r = params.get("route");
      if (r) route = r;
      if (params.get("action") === "observe" && P.state.onboarded) modal = { type: "obs", id: null };
    } catch (e) {}

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window.Polaris = window.Polaris || {});
