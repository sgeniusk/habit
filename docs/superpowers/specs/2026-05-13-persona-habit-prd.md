# Persona Habit PRD

## Product Definition

Persona Habit is a lifestyle snap app that helps people discover habits they do not notice themselves, then nudges those patterns toward healthier routines. Users capture daily moments across study, meals, exercise, reading, cleaning, and self-care. The app turns those snaps into collectible personas, a customizable persona home, lightweight social groups, and AI habit insights.

Working title: **Persona Habit**

Korean positioning: **내가 모르는 습관까지 발견해서 건강하게 키워주는 생활 스냅 앱**

## Problem

Habit apps often ask users to check off tasks, but checklists do not create enough emotional reward. Life-log apps collect records, but users rarely feel a reason to keep going. Users also miss patterns that are obvious in hindsight: where they study best, what time they snack, whether they exercise only with friends, or which environment makes them consistent.

## Target Users

- Students and exam takers who need study consistency.
- Young professionals trying to balance exercise, food, study, and self-care.
- Friend groups who want lightweight accountability without a strict productivity tool.
- Users who like cute character collection, avatar progression, and visible growth.

## Core Value

The app gives users three rewards for taking lifestyle snaps:

1. Immediate reward: persona XP, outfits, room decor, and collectible items.
2. Social reward: groups where friends grow a shared persona together.
3. Reflective reward: AI discovers hidden behavior patterns and suggests healthier routines.

## MVP Scope

### 1. Lifestyle Snap

Users can create a record with:

- Photo upload or camera capture.
- Category: study, meal, exercise, reading, cleaning, self-care, hobby.
- Place type: home, library, school, cafe, gym, restaurant, outdoors, other.
- Optional memo.
- Optional filters, stickers, and a short label.
- Timestamp, location-derived area, and weather.

The first prototype can simulate camera capture through browser file input. Native camera APIs are not required for the prototype.

### 2. Persona Collection

The user owns multiple personas. A persona can be created or strengthened by repeated snaps:

- Study records grow study personas.
- Running and exercise records grow active personas.
- Meal records grow nutrition personas.
- Mixed patterns create hybrid personas such as "studious runner" or "healthy exam taker."
- Reading, cleaning, self-care, and hobby records create support personas such as page collector, room resetter, recovery manager, or taste explorer.

Each persona has:

- Level.
- XP.
- Style tags.
- Growth history.
- Unlockable outfits and room items.
- Evolution milestones.
- Lightweight motion states such as idle breathing, blinking, waving, item bounce, and room mood reactions.

### 3. Today And Journal

The Today tab is the app's daily entry point:

- Representative persona shown outdoors.
- Current location-derived area and weather.
- Today's snap count, recent records, and a top hidden-habit insight.
- Journal mode selection: AI-assisted writing or self-written entry.
- Journal drafts can use photo, location, weather, mood, and category context.

The journaling experience can benchmark personal diary apps such as Day One, but the Persona Habit loop should remain: lifestyle snap -> persona growth -> daily reflection.

### 4. Home And Customization

The former Personas tab becomes Home. When users open Home, they see what their representative persona is doing inside its room.

- Study persona: reading, reviewing notes, or sitting at a focused desk.
- Exercise persona: stretching, drying running shoes, or recovering.
- Meal persona: preparing lunch, drinking water, or planning meals.
- Cleaning persona: resetting the desk or organizing the room.
- Hybrid persona: mixed habit props such as books, water, and running shoes.

Users can decorate both the room and the persona. Snap records unlock furniture, backgrounds, outfits, props, and motion states.

### 5. Hidden Habit AI

AI analyzes repeated records and produces useful observations:

- Strong locations: "You study most consistently in libraries."
- Weak windows: "Late-night meal photos cluster after long study days."
- Healthy nudges: "Try a lighter 10 PM routine on days with two study records."
- Identity framing: "You are becoming a steady environment-based learner."

The MVP can show prewritten insight logic in the prototype. Production should use an AI pipeline once user data and privacy flows are ready.

### 6. Groups And Social Loop

Users can create or join groups:

- Study group, meal group, run group, or mixed lifestyle group.
- Invite friends by link.
- Each member's snaps add XP to the group persona.
- Group mood and persona traits are affected by group behavior.
- Lightweight streaks encourage participation without shame.

### 7. Reports

The app generates:

- 7-day lifestyle report.
- Persona growth summary.
- Category balance.
- Place and time patterns.
- AI habit recommendations.

## Non-Goals For MVP

- Real payment or subscriptions.
- Full AI image recognition.
- Fraud detection.
- Native iOS/Android distribution.
- GPS background tracking.
- Partner data integrations.

## Native App Direction

The production app should be built with Expo React Native for iOS and Android because it supports:

- Camera capture.
- Photo library access.
- Push notifications.
- Location permissions.
- App Store and Play Store delivery.
- A shared React codebase.

The current prototype should be a web app that validates product flow and visual direction before native implementation.

## Data Model Draft

### User

- id
- displayName
- selectedPersonaId
- joinedGroupIds

### SnapRecord

- id
- userId
- imageUrl
- category
- placeType
- memo
- createdAt

### Persona

- id
- ownerUserId
- archetype
- name
- categoryAffinity
- level
- xp
- traits
- unlockedItems
- evolutionStage

### Group

- id
- name
- theme
- memberIds
- groupPersona
- weeklyXp
- recentRecords

### Insight

- id
- userId
- period
- title
- body
- recommendation
- confidence

## Prototype Requirements

The prototype should include five mobile-first tabs:

- Today: outdoor representative persona, location/weather, daily snap prompt, journal mode choice, recent records, top hidden habit.
- Snap: category/place selection, photo upload/capture state, filters, stickers, mood line, decorated upload CTA.
- Home: representative persona activity, room decor, persona styling, owned persona collection.
- Groups: friend group status and group persona.
- Report: 7-day AI pattern summary and healthy next actions.

The prototype should feel like a real app surface, not a landing page. It should make the character-growth incentive immediately visible.

The prototype character should not be a video asset. It should be built from lightweight UI layers so it can later react to user behavior, habit category, home or group state, and persona evolution.

## Success Criteria

- A user understands within 10 seconds that lifestyle snaps grow personas.
- A user can imagine recording study, meal, and exercise without extra explanation.
- Persona growth, collectible customization, evolution, and multiple personas are visible.
- Social groups feel like an accountability loop, not a generic chat feature.
- AI insights clearly connect lifestyle records to healthier habits.
