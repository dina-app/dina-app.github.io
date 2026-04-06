# Battle Nexus Legends — Task-by-Task Implementation Roadmap

## Phase 0 — Foundations (Week 1)
1. Initialize monorepo layout: `client`, `server`, `shared-data`, `tools`.
2. Define TypeScript domain schemas for Player, Character, Ability, Match, GoalZone, WildMonster.
3. Add config loader + JSON validation for character/ability/map data.
4. Establish deterministic server tick loop and state snapshot format.

## Phase 1 — Playable Core Loop (Weeks 2–4)
1. Implement map primitives (lanes, jungle, bases, goal zones, bushes).
2. Add player spawn/movement/targeting pipeline.
3. Implement combat primitives (basic attack, projectile, melee hitbox, damage types).
4. Add EXP gain and per-level stat scaling.
5. Add scoring energy pickup + channel-to-score goal interaction.
6. Add death/respawn scaling and base respawn logic.
7. Add match timer, final stretch modifier, winner determination.

**Milestone A:** Headless 5v5 simulation can complete full matches.

## Phase 2 — Character Kit System (Weeks 5–6)
1. Build ability executor framework (cast types, targeting modes, cooldowns, interrupts).
2. Add status effect engine (stun/slow/root/silence/shield/DoT/etc).
3. Implement skill branch upgrades at level milestones.
4. Implement evolution/transformation with HP-percent preservation.
5. Author 6 starter characters via config.

**Milestone B:** All 6 starter characters playable with unique kits.

## Phase 3 — AI and Objectives (Weeks 7–8)
1. Implement wild monster AI (idle/aggro/leash/reset).
2. Implement major objective boss AI and spawn scheduler.
3. Add bot behavior trees/utility AI for lane, jungle, retreat, score, contest.
4. Add easy/normal/hard difficulty tuning table.

**Milestone C:** Full offline match with bots and objectives feels complete.

## Phase 4 — Networking, Lobbies, Matchmaking (Weeks 9–10)
1. Build account/session service (basic auth for prototype).
2. Build lobby service (party, invites, ready checks, lock-in flow).
3. Build queue service (casual/ranked, party constraints, MMR bands).
4. Add reconnect flow and state resync.

**Milestone D:** End-to-end online match from queue to results.

## Phase 5 — UI/UX and Meta Systems (Weeks 11–12)
1. Main menu/navigation shell.
2. In-match HUD (minimap, cooldowns, score, alerts, feed).
3. End-match results and rewards summary.
4. Player profile, unlock inventory, basic loadout presets.
5. Quest tracker (daily/weekly simple rules engine).

**Milestone E (MVP):** Public playtest-ready vertical slice.

## Phase 6 — Stabilization and Live Ops Prep (Weeks 13–14)
1. Telemetry events (combat, scoring, objectives, retention funnels).
2. Balance tooling and hot-config update workflow.
3. Crash reporting and anti-cheat rule checks.
4. Ranked progression tuning and season config scaffolding.

## Cross-Cutting Engineering Practices
- Server-authoritative simulation for competitive integrity.
- Config-driven content pipeline (no hard-coded character abilities).
- Feature flags for experiments and limited-time rules.
- Replay-compatible event log format (future spectator/replay support).
- Automated tests:
  - unit tests for formulas and status stacking
  - simulation tests for full match completion
  - integration tests for lobby/queue lifecycle
