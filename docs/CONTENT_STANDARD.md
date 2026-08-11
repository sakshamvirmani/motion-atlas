# Motion Atlas lesson and example standard

Version: 1

Last updated: 2026-08-11

## Definition of publishable

A lesson is publishable only when a beginner can understand its purpose, interact with or build its core idea, verify the result, and recover from the most likely failures. Attractive copy or a working animation alone is not enough.

## Required lesson fields

Every canonical lesson record must include:

- stable `slug` and concept IDs;
- title and one-sentence promise;
- module, required or elective status, order, and estimated active time;
- prerequisites expressed as lesson or concept IDs;
- minimum iOS, Swift, SwiftUI, and Xcode availability where relevant;
- last technical review date;
- learning objective stated as observable behavior;
- plain-language mental model;
- common wrong model or misconception;
- prediction prompt;
- interactive lab or Xcode exercise;
- worked example;
- faded example or completion task;
- independent transfer task;
- retrieval questions with explanations for every option;
- primary sources and optional secondary reading;
- Reduce Motion behavior when the lesson contains meaningful movement;
- accessibility, interruption, performance, and testing notes when relevant;
- completion evidence type;
- changelog entry when an API or explanation materially changes.

The build should fail if a published lesson omits a required field.

## Explanation order

Teach in this order unless the topic has a documented reason to differ:

1. **Visible behavior:** what the learner sees or does.
2. **State change:** the truth before and after.
3. **Changing values:** opacity, position, scale, path, layout, content, or another value.
4. **Timing behavior:** easing, spring, phase, keyframe, or direct gesture tracking.
5. **SwiftUI mechanism:** the smallest API that expresses the behavior.
6. **Failure boundaries:** identity, hierarchy, transaction scope, interruption, availability, and performance.

Do not begin a beginner lesson with a wall of framework vocabulary.

## Worked-example ladder

Each technical concept uses three levels:

### 1. Complete example

- Small enough to read on one screen where practical.
- Runs independently or names all required surrounding code.
- Annotated by responsibility, not by narrating every punctuation mark.
- Shows the correct static start and end states before animation.

### 2. Faded example

- Removes one meaningful decision at a time.
- Gives a goal, constraints, and observable acceptance result.
- Supplies hints in layers rather than revealing the final code immediately.

### 3. Transfer task

- Changes the visual context and at least one implementation constraint.
- Cannot be completed by renaming the sample.
- Requires the learner to choose the state owner or animation tool.

## Code standard

- Swift code must compile under the lesson's declared stable Xcode toolchain.
- Use modern SwiftUI syntax for the declared deployment target.
- Avoid deprecated modifier overloads in new core lessons.
- Keep state ownership explicit and local until a model genuinely earns extraction.
- Avoid `DispatchQueue.main.asyncAfter` as a default choreography tool.
- Avoid timers for animation when phase, keyframe, timeline, or state-driven composition is more correct.
- Never use random values in a deterministic teaching example unless randomness is the topic and tests control the seed.
- Avoid force unwraps and `try!` in beginner product code. If a tiny isolated demo uses one, explain why and show the production boundary.
- Include imports, type declarations, state, and preview or parent context needed to run.
- Label pseudocode as pseudocode.
- Show availability checks or fallbacks for newer APIs.
- Format code consistently and keep names based on product meaning.

## Animation correctness checklist

Every animation example answers:

1. What event changes state?
2. Who owns that state?
3. What are the exact start and end values?
4. Which values can interpolate?
5. Where is the animation attached or injected?
6. Which transaction carries it?
7. What is the view's identity before and after?
8. What happens if input repeats rapidly?
9. What happens if the animation is interrupted midway?
10. What does Reduce Motion do instead?
11. Does meaning remain available without motion?
12. What is the performance cost and lifetime?

## Interactive lab standard

Labs are learning instruments, not decorative demos.

Each lab must provide:

- a prediction before first playback;
- visible start and end state labels;
- no more than three primary controls at first exposure;
- a clear play, pause when relevant, replay, and reset path;
- exact value readouts;
- a short explanation of what changed after interaction;
- keyboard control and semantic labels;
- a reduced-motion preview;
- a copyable SwiftUI result only after the learner has manipulated the idea;
- deterministic reset behavior;
- no mandatory autoplay;
- no success state that relies only on color or confetti.

Advanced labs may reveal additional controls progressively.

## Quiz and retrieval standard

- Prefer prediction, diagnosis, compare-and-contrast, and code completion over vocabulary recognition.
- Every answer option receives a specific explanation.
- Wrong answers should identify the likely mental model, not shame the learner.
- Reattempts remain available.
- A delayed review should vary the surface context while testing the same concept.
- Mix easily confused concepts only after each has been introduced clearly.
- Do not use streak loss, countdown pressure, or dark patterns.

## Accessibility standard

- Explain `accessibilityReduceMotion` in native SwiftUI lessons that include potentially uncomfortable motion.
- Reduced motion is an alternate design: replace large spatial travel, depth, blur, or bounce with a brief fade, highlight, or content change that preserves meaning.
- Avoid rapid flashing and excessive peripheral motion.
- Maintain full controls and information when motion is reduced or disabled.
- Provide button alternatives for drag, swipe, pinch, and other gestures when the action is essential.
- VoiceOver describes resulting state and action, not visual choreography.
- Examples must survive large Dynamic Type and narrow widths.
- Do not require precise timing to complete a lesson.

## Performance standard

Every continuous, scroll-driven, Canvas, TimelineView, shader, particle, Lottie, or Rive example must state:

- when it starts and stops work;
- what happens off-screen and in the background;
- whether it invalidates layout or only rendering;
- the expected device and OS range;
- how to profile it;
- the acceptable fallback when performance or power constraints require less motion.

Do not declare an animation “60 FPS” without measuring on named hardware or Simulator conditions. Simulator performance is not physical-device proof.

## Third-party runtime standard

For Lottie, Rive, or another dependency, include:

- why native SwiftUI is insufficient for the chosen example;
- package owner and official installation source;
- supported platform and version statement from the owner;
- asset origin and license;
- file-size and loading behavior;
- playback and lifecycle control;
- Reduce Motion behavior;
- rendering limitations;
- test strategy;
- removal or fallback plan.

Never call a Lottie JSON file an animated SVG. Never describe Rive as merely a video or Lottie replacement; its state-machine and data-binding behavior is the relevant distinction.

## Vibe-coding lesson standard

AI assistance must increase agency rather than create opaque copy-paste behavior.

Each vibe-coding exercise requires the learner to specify:

- component and user goal;
- explicit states and events;
- state owner;
- visual start and end states;
- motion role and character;
- interruption and repeated-input behavior;
- OS target and allowed APIs;
- Reduce Motion behavior;
- accessibility requirements;
- acceptance checks.

After generation, the learner must:

1. compile the unchanged result;
2. identify every state property and animation boundary;
3. remove or explain every unfamiliar line;
4. test at least one adverse interaction;
5. make one independent change without asking the model for a full rewrite;
6. record what evidence proves the result.

## Sources and evidence

Technical source order:

1. Apple documentation, sample code, HIG, and WWDC sessions
2. Official runtime documentation for third-party tools
3. Maintainer source repositories and release notes
4. Trusted secondary explanations

Every source record includes URL, owner, title, date checked, and the claim or API it supports. Links that merely inspire appearance belong in a separate inspiration field.

Do not reproduce paid course content, long copyrighted passages, proprietary assets, or another creator's distinctive example. Learn from coverage and pedagogy, then write original explanations, diagrams, and builds.

## Review workflow

Each lesson passes four reviews:

### Technical review

- Sources current
- API availability accurate
- Code compiled
- Failure cases verified

### Beginner review

- New vocabulary introduced before use
- Steps can be followed from the declared prerequisites
- No unexplained project setup
- Cognitive load is appropriately staged

### Product review

- Lab and progress behavior works
- Links and stable IDs work
- Mobile and keyboard behavior works
- Completion evidence is truthful

### Motion and accessibility review

- Motion has a named purpose
- Interruption and repetition tested
- Reduced-motion behavior verified
- Performance lifetime explained

## Build-time content checks

The content pipeline should generate and test:

- unique slugs and IDs;
- valid prerequisite graph with no cycles;
- old-ID redirects;
- source presence and URL shape;
- valid code file references;
- minimum OS metadata;
- lab and quiz registry references;
- generated curriculum counts;
- generated sitemap and per-lesson metadata;
- no placeholder markers such as `TODO`, `lorem ipsum`, or empty published sections.

## Public trust indicators

Show only generated, verifiable facts:

- “Reviewed on [date]”
- “Compiles with Xcode [version]”
- “Requires iOS [version]”
- “Reduced-motion example included”
- “Source-audited”

Do not show “industry best,” “complete forever,” or “master in X days” as factual promises.
