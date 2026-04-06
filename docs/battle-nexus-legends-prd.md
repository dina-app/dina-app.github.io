# Battle Nexus Legends — Product Requirements Document (PRD)

## 1) Product Overview

**Battle Nexus Legends** is a cross-platform, session-based, team battle arena game inspired by Pokémon Unite-style mechanics.

- Match format: 5v5 (primary), 3v3 (quick mode)
- Session length: 10 minutes
- Core loop: defeat wild monsters → gain EXP/score energy → upgrade/evolve → score in enemy goal zones → win by team score
- Platforms: Web-first architecture with mobile/desktop input support and controller-ready abstractions

## 2) Goals and Non-Goals

### Goals
- Deliver a fun MVP with clear role-based team play and objective-focused scoring.
- Keep systems highly data-driven for rapid balance and content iteration.
- Support bots for training and queue backfill.
- Build a modular codebase with clear boundaries (gameplay/UI/network/data/AI).

### Non-Goals (MVP)
- Full esports/spectator tooling
- Guild/clan systems
- Replay system
- Full monetization complexity beyond basic unlock/shop skeleton

## 3) Player Experience Pillars
- **Accessible:** simple controls, guided onboarding, readable combat feedback
- **Strategic:** lane/jungle decision-making, objective timing, team composition
- **Fast-Paced:** meaningful level/skill spikes, short respawn loops, final-stretch tension
- **Expressive:** varied creature kits, role identity, cosmetic customization

## 4) Core Gameplay Requirements

### 4.1 Match Rules
- Default timer: 10:00
- Final stretch starts at 2:00 remaining
- Team score always visible
- Death triggers respawn timer scaling by level and elapsed match time
- Winner: team with highest total scored points at timer end

### 4.2 Match Modes
- Ranked 5v5
- Casual 5v5
- Quick 3v3
- Bot training mode
- Private custom lobby

### 4.3 Required Actions
- Move, basic attack, skill 1, skill 2, ultimate, battle item, recall, score channel, ping/minimap interaction
- Target modes: auto-target nearest + manual target lock
- Mobile aids: aim assist, drag-to-aim, cancel cast, optional tap-to-move

## 5) Systems Requirements

### 5.1 Character/Creature System
Each creature definition must include:
- id, name, role, stats, passive, ability set, progression milestones, evolution stages, cosmetic metadata, unlock info

Roles:
- Attacker, Defender, Speedster, Supporter, All-Rounder

Stats:
- HP, ATK, DEF, SPATK, SPDEF, move speed, crit chance, attack speed, CDR, level scaling, scoring speed modifier

### 5.2 In-Match Progression
- EXP from wild monsters, enemy KOs, assists, and objective participation
- Level milestones unlock/upgrade skills and evolution
- Level-up VFX + UI toast
- Ultimate unlock around level 9 (configurable)

### 5.3 Ability Framework
Ability schema supports:
- passive/basic/enhanced basic/skill1/skill2/ultimate/battle item
- cooldown, cast time, range, AoE, scaling formulas, targeting mode, hit/status effects, SFX/VFX hooks

Targeting modes:
- single target, line, cone, circle AoE, self-buff, dash, teleport, channel, lock-on

Status effects:
- stun/slow/root/silence/knock-up/knockback/blind/DoT/shield/HoT/speed or attack-speed modifiers/defense shred/stealth

### 5.4 Combat
- Real-time hit detection (projectile + melee hitboxes)
- Physical/special/true/DoT/execute/%maxHP/missingHP damage types
- Crit logic, shields, healing, assists
- Interrupt windows, immunity windows, shared cooldown support

### 5.5 Map and Objectives
Map includes:
- two bases, 2–3 lanes, jungle, wild camps, major objective pits, goal zones, bushes, minimap hooks

Goal zones:
- score channel time scales with carried points
- interrupted by incoming damage/CC
- friendly zone aura effects (heal/shield/speed)

Bush/vision:
- hidden unless revealed by proximity/rules
- attack/cast reveal behavior configurable

### 5.6 AI
- Bot lanes/pathing, fight/retreat/scoring/objective logic
- difficulty tiers: easy/normal/hard
- Monster AI: idle/aggro/leash/reset/target switching

### 5.7 Networking
- account auth, lobby rooms, matchmaking, reconnect, latency compensation
- server-authoritative simulation for movement/combat/scoring
- anti-cheat validation layer

## 6) UX Requirements

### 6.1 Main Menu
Play, ranked, casual, training, creatures, shop, events, battle pass, profile, settings, notifications

### 6.2 In-Match HUD
Minimap, timer, team score, HP, carried score, level, ability buttons/cooldowns, ultimate state, battle item, kill feed, objective alerts, pings, target indicators

### 6.3 End-Match Results
Winner banner, final score, KDA, points scored, damage/healing, objective participation, MVP, rewards, rank changes

## 7) Data Model Contracts (MVP)
- **Player**: id, name, level, rank, currencies, unlocked content, loadouts, match history
- **Character**: id, role, stats, evolution stages, abilities, passive, unlock cost
- **Ability**: id, type, cooldown, formulas, range, status effects, upgrade path
- **Match**: id, mode, map, players, timer, team scores, objective states, winner
- **WildMonster**: id, type, spawn point, respawn timer, rewards
- **GoalZone**: id, team owner, state, multiplier, aura config

## 8) MVP Scope (Release 0)
- 1 map
- 5v5 mode
- 6 starter creatures (Flareclaw, Mosshorn, Voltshade, Tidelia, Ironfang, Frostmoth)
- basic bots
- 1 major objective + 3 minor wild camps
- scoring + final stretch
- character select + simple lobby
- end-match summary + profile save

## 9) Success Metrics (MVP)
- Match completion rate
- Average match duration near 10 minutes
- New player tutorial completion
- Day-1 retention
- Queue time (casual/ranked)
- Bot-vs-player win parity at normal difficulty

## 10) Live-Service Readiness
- Config-first balancing (character/ability/objective tables)
- Event scheduler hooks
- Feature flags for map/mode experiments
- Telemetry for skill usage, scoring timing, objective impact
