# Motion Atlas curriculum map

Version: draft 1

Last updated: 2026-08-11

## Curriculum promise

A complete beginner should finish the required path able to:

1. explain how an iOS app, Swift, SwiftUI, state, rendering, and animation relate;
2. build and run a SwiftUI app in Xcode;
3. choose purposeful motion based on feedback, continuity, hierarchy, or status;
4. implement, interrupt, debug, and test native SwiftUI animations;
5. design an equivalent reduced-motion experience;
6. use AI assistance without surrendering understanding or verification;
7. profile and ship a small animated app with truthful quality evidence.

The course is layered so detail does not become overload:

- **Required path:** 60 short lessons and module builds. This is the guided zero-to-production journey.
- **Mastery electives:** 36 deeper lessons and pattern studies. These appear when prerequisites are complete or when a learner searches for them.
- **Reference library:** API cards, failure atlas, glossary, motion recipes, and copyable snippets. Reference material is not presented as another linear course.
- **Web Motion Bonus:** a separate eight-lesson track for CSS, scroll animation, Motion for React, Framer concepts, and GSAP. It never changes iOS completion percentage.

## Supported toolchain policy

- Author and compile with the current stable Xcode.
- Keep the broad core compatible with a declared baseline, initially iOS 17 where practical.
- Label every newer API with its minimum OS.
- Provide a fallback when a newer API expresses a common product need and the fallback is realistically maintainable.
- Keep iOS 18 navigation transitions and iOS 26 visual-system topics as clearly labeled lessons rather than silently raising the entire course baseline.
- Re-run the complete source audit after each WWDC and stable Xcode release.

## Required path and electives

### Module 0: Begin from zero

Required lessons: 4. Electives: 0.

Outcomes:

- Replace the “animated SVG” misconception with a correct technology map.
- Make one value move before learning syntax.
- Understand the course loop and how progress is measured.
- Install or identify Xcode, Simulator, Swift, and SwiftUI.

Lessons:

1. What an app is
2. What animation is: a value changing over time
3. Native SwiftUI versus SF Symbols, Lottie, Rive, video, and static vectors
4. Run the first app and change one visible value

Build checkpoint: a one-screen “tap to breathe” circle with a play and reset control.

### Module 1: Xcode and iOS app anatomy

Required lessons: 6. Electives: 2.

Required coverage:

1. Projects, targets, files, assets, and build settings in plain language
2. App, Scene, WindowGroup, and the first view tree
3. Xcode editor, issue navigator, previews, and Simulator
4. Read one compiler error without panic
5. Run on Simulator and understand build versus runtime failure
6. Assets, SF Symbols, color, and vector-image boundaries

Electives:

- Source control and a safe experiment branch
- Physical device, signing, and the boundary between local proof and a shipped build

Build checkpoint: recreate a static focus-session screen from a visual spec.

### Module 2: Swift needed for motion

Required lessons: 8. Electives: 2.

Required coverage:

1. Values, types, `let`, and `var`
2. Booleans and state changes
3. Functions, parameters, return values, and readable names
4. Structs and initializers
5. Conditions and switch statements
6. Arrays, loops, identity, and `Identifiable`
7. Optionals and safe absence
8. Closures through the lens of a button action and animation content

Electives:

- Enums with associated values for explicit interaction state
- Async and MainActor boundaries for loading-to-success motion

Build checkpoint: model idle, running, paused, and completed focus states without animation.

### Module 3: SwiftUI's mental model

Required lessons: 8. Electives: 4.

Required coverage:

1. Declarative UI: state first, view as a description
2. Composition and the view tree
3. Modifiers and modifier order
4. Layout proposals, size, position, and why offset does not relayout siblings
5. `@State` and single source of truth
6. `@Binding` and controlled child interaction
7. `@Observable`, environment, and separating model from view
8. Identity in `if`, `ForEach`, and navigation

Electives:

- Custom Layout and animated layout changes
- AnyLayout and layout switching
- Geometry reading without feedback loops
- Observation performance and unnecessary view invalidation

Build checkpoint: a static expandable focus card with correct state, identity, and layout at large text sizes.

### Module 4: Motion design literacy

Required lessons: 7. Electives: 3.

Required coverage:

1. Motion roles: feedback, status, continuity, hierarchy, and attention
2. Values, interpolation, duration, delay, and frame perception
3. Linear and eased timing; read and sketch a curve
4. Springs as target-seeking systems
5. Choreography, leading action, overlap, and staggering
6. Direct manipulation, velocity, and interruption
7. Restraint, cancellation, and reduced-motion design

Electives:

- The classic animation principles that transfer to interface motion
- Sound and haptic reinforcement without duplicating or overwhelming meaning
- Motion tokens and role-based defaults

Build checkpoint: critique three motion clips, name the role and changing values, then tune one original interaction in the motion laboratory.

### Module 5: The SwiftUI animation system

Required lessons: 8. Electives: 4.

Required coverage:

1. First state-driven animation with `withAnimation`
2. `.animation(_:value:)` and precise dependency scope
3. Animation composition: delay, speed, repeat, and autoreverse
4. Springs, presets, duration and bounce, and interactive springs
5. Transactions and local overrides
6. Completion criteria and logical versus removed completion
7. Animate transforms, color, shape, and layout with correct expectations
8. Diagnose “why did this animate?” and “why did nothing animate?”

Electives:

- Custom `Animation` and `CustomAnimation`
- Velocity-aware replacement and merge behavior
- Binding animations
- The current `@Animatable` macro and availability fallback

Build checkpoint: a settings confirmation control that behaves correctly under rapid repeated taps.

### Module 6: Transitions, content, and continuity

Required lessons: 5. Electives: 4.

Required coverage:

1. Transition versus ordinary property animation
2. Asymmetric and combined transitions
3. Content transitions for numbers, text, and symbols
4. `matchedGeometryEffect`, namespaces, and stable identity
5. Navigation and presentation continuity

Electives:

- Custom `Transition` protocol implementation
- Zoom navigation and matched transition sources on supported OS versions
- Hero-transition failure atlas: identity, clipping, z-order, source lifetime, and scroll containers
- Cross-framework transition boundary for hosted UIKit content

Build checkpoint: a list-to-detail focus-session transition with a reduced-motion dissolve and unchanged information hierarchy.

### Module 7: Gestures, scroll, and responsive motion

Required lessons: 5. Electives: 4.

Required coverage:

1. Drag gesture state versus committed state
2. Gesture-following motion and spring settlement
3. Predicted end, velocity, thresholds, and cancellation
4. Scroll transition phases and visual effects
5. Sheets, carousels, and swipe actions with accessible button alternatives

Electives:

- Scroll geometry and visibility observation
- Scroll position and programmatic motion
- Gesture composition and conflict diagnosis
- Haptics and `sensoryFeedback` at semantic state boundaries

Build checkpoint: a draggable session card that tracks the finger, makes a deterministic commit decision, can be interrupted, and works without the gesture.

### Module 8: Sequences, drawing, symbols, and asset runtimes

Required lessons: 4. Electives: 8.

Required coverage:

1. `PhaseAnimator` for named discrete stages
2. `KeyframeAnimator`, tracks, and keyframe types
3. SF Symbol effects and content replacement
4. Choose native SwiftUI, Lottie, Rive, static vector, or video

Electives:

- `Animatable`, `VectorArithmetic`, and animated custom shapes
- `Canvas` and `TimelineView`
- TextRenderer and animated text effects
- Mesh gradients and visual effects
- Metal shader effects with safety and fallback boundaries
- Lottie SwiftUI integration, playback, scrubbing, caching, and snapshot tests
- Rive state machines, data binding, settling, and runtime control
- Particle and emitter boundaries, including when SpriteKit is the more appropriate subsystem

Build checkpoint: choose and justify the smallest technology for three product moments, then build one native multi-step success sequence.

### Module 9: Production motion

Required lessons: 5. Electives: 5.

Required coverage:

1. Reduce Motion as an alternate behavior that preserves meaning
2. Dynamic Type, VoiceOver state, contrast, flashing, and non-gesture access
3. Performance model: invalidation, layout, drawing, offscreen work, and energy
4. Test endpoints, interruption, repetition, backgrounding, and slow animations
5. Profile, archive, TestFlight, and evidence boundaries

Electives:

- SwiftUI performance instruments and signposts
- Snapshot and visual-regression tests for animation endpoints
- Deterministic clocks and test-friendly animation dependencies
- Low Power Mode, thermal state, and continuous-loop budgets
- Animation review checklist for a design system

Build checkpoint: audit and harden an intentionally broken animation against the production matrix.

### Module 10: Vibe-code studio and capstones

Required lessons are included in the 60-lesson total as project sessions, not additional lectures. The studio also contains optional drills.

Required behaviors:

- Translate a visual idea into states, events, changing values, hierarchy, motion role, and acceptance checks.
- Ask an AI coding partner for one bounded component at a time.
- Inspect every state property, ID, transition boundary, and availability requirement.
- Compile and run before asking for polish.
- Diagnose failures from evidence rather than re-prompting randomly.
- Preserve originality when using reference products.

Capstone ladder:

1. **Microinteraction sheet:** six small controls covering feedback, content change, and Reduce Motion.
2. **Focus Flow:** a multi-screen SwiftUI app with drag, transition, sequence, persistence, accessibility, and performance checks.
3. **Motion system handoff:** reusable motion tokens, component patterns, design rationale, test matrix, and a short demo reel made from the learner's own work.

## Web Motion Bonus

This track is discoverable from a separate “Web motion” area and has its own progress percentage.

1. CSS transitions and keyframes
2. Web Animations API and playback control
3. Scroll-triggered versus scroll-linked motion
4. IntersectionObserver and progressive enhancement
5. CSS scroll-driven animations
6. Motion for React, formerly Framer Motion
7. GSAP timelines and ScrollTrigger
8. Scroll-story capstone with accessibility, performance, and reduced motion

The bonus track should explain Framer as a visual site-building environment separately from Motion for React as a code library. Do not use “Framer,” “Framer Motion,” and “Motion” interchangeably.

## Learning loop

Every concept lesson follows this sequence:

1. **Orient:** one concrete outcome and prerequisite check.
2. **Predict:** commit to what will happen before playback or compilation.
3. **Manipulate:** change one variable in a live instrument.
4. **Name:** attach correct vocabulary to the observed behavior.
5. **Model:** see the state and rendering explanation.
6. **Study:** inspect a small complete worked example.
7. **Fade:** complete a partially specified variation.
8. **Build:** solve a transfer task without copying the original.
9. **Explain:** state why the code and motion boundaries are correct.
10. **Retrieve later:** schedule the concept for a future mixed review.

## Mastery rules

A lesson can be marked read at any time. A concept is considered demonstrated only when the learner:

- predicts a key behavior;
- answers at least one retrieval question;
- completes the lab or Xcode task;
- passes a small transfer check or explains the result in their own words.

Do not lock the whole course behind quizzes. Use mastery signals to recommend review and to unlock optional challenge labels, not to punish or trap beginners.

## Existing-content migration

The current 48 iOS lessons contain valuable copy, quizzes, and labs. Migrate them by concept, not by blindly preserving IDs.

For each existing lesson:

1. Map it to one canonical concept ID and module.
2. Split it if it currently teaches more than one independently testable idea.
3. Keep original examples only when they pass the content standard.
4. Add primary sources, availability, failure cases, and compile evidence.
5. Preserve the old numeric ID in a redirect map so saved progress can migrate.
6. Separate the existing eight web lessons from iOS completion.

## Coverage dashboard

The public curriculum should eventually display truthful generated counts:

- required lessons published and source-audited;
- electives published;
- interactive labs available;
- code samples compile-checked against the current stable Xcode;
- lessons with reduced-motion examples;
- lessons reviewed after the latest WWDC;
- known outdated or temporarily unavailable examples.

Counts must come from the canonical content registry at build time. Never type marketing counts by hand.
