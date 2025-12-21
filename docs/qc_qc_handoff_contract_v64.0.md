# QC INPUT → QC-5 HANDOFF CONTRACT
## FindMyWhy.ai Quick Clarity Pipeline

**Version**: v64.0.0  
**Status**: Authoritative Specification  
**Scope**: Data structure and constraint enforcement only

---

## CONTRACT OVERVIEW

User provides four text inputs (QC1-QC4).  
QC-5 receives four text inputs directly.  
No interpretation layer exists between them.

---

## USER INPUT SCHEMA (REQUIRED)

```json
{
  "session_id": "string (generated, not user-provided)",
  "timestamp": "iso8601",
  
  "qc1_decision": "string (the original question)",
  "qc2_choice_frame": "string (the real choice being considered)",
  "qc3_influences": "string (what is influencing the choice)",
  "qc4_forced_pick": "string (what the user would pick if forced now)"
}
```

---

## INPUT CHARACTERISTICS

### User Inputs Are Unstructured
- Inputs are free-form text
- Length varies (may be 5 words or 500 words)
- Quality varies (may be specific or vague)
- Coherence varies (may contain contradictions)
- No validation or preprocessing occurs

### QC-5 Must Work Conservatively
- QC-5 receives raw user text as-is
- QC-5 must not assume unstated context
- QC-5 must not reinterpret or expand meaning
- QC-5 must scale output to input quality

---

## HANDOFF CONSTRAINTS (ENFORCED)

### Input Authority
- The four inputs are complete and sufficient
- QC-5 may not request additional information
- QC-5 may not invent context beyond what is stated
- QC-5 may not reference external models or frameworks

### Input Interpretation Rules
- User words are taken at face value
- Vague inputs result in vague outputs (this is correct)
- Contradictory inputs may be noted but not resolved
- Thin inputs result in thin outputs (safety feature)

### No Analysis Layer
- Unlike Deep-Dive (DM4→DM5), QC has no intermediate analysis
- QC-5 works directly with user text
- QC-5 performs no pattern extraction or theme building
- QC-5 performs no tension detection or directional analysis
- QC-5 must remain at surface level

### Evidence Traceability
- Every QC-5 output claim must trace to one of the four inputs
- QC-5 may not synthesize insights beyond what inputs show
- QC-5 may not assume motivations or values not stated
- QC-5 may not paraphrase in ways that add interpretation

---

## INPUT FIELD SEMANTICS

### qc1_decision
- What user initially framed as the question
- May or may not be the actual decision
- May be vague or off-target
- QC-5 uses this as context only, not as authoritative framing

### qc2_choice_frame
- What user identifies as the real choice
- This is the primary anchor for distilled_choice
- May contradict qc1_decision (this is valid)
- QC-5 observes the framing, does not validate it

### qc3_influences
- What user says is influencing the choice
- May be external (people, circumstances) or internal (fears, desires)
- May or may not align with qc4_forced_pick
- QC-5 describes influences, does not evaluate them

### qc4_forced_pick
- What user would choose if forced to decide now
- Reveals instinctual pull
- May contradict qc3_influences (this is significant)
- QC-5 notes what this reveals, does not prescribe following it

---

## QC-5 INPUT REQUIREMENTS

QC-5 receives the complete input object.

QC-5 MUST:
1. Use only the provided four text inputs
2. Work at surface level only
3. Scale output to input quality
4. Note contradictions without resolving them
5. Maintain observational voice throughout
6. Output valid JSON only

QC-5 MUST NOT:
1. Add themes or patterns not explicitly in inputs
2. Assume psychological depth not stated by user
3. Manufacture clarity from vague inputs
4. Resolve contradictions between inputs
5. Continue past the JSON boundary
6. Frame observations as recommendations

---

## QUALITY GATES (VALIDATION CHECKS)

Before QC-5 generation:

✓ All four input fields are present  
✓ Input lengths are within reasonable bounds (1-2000 chars each)  
✓ session_id and timestamp are valid  

After QC-5 generation:

✓ Output is valid JSON  
✓ All six required keys are present  
✓ No forbidden language appears in any field  
✓ Each field is 1-2 sentences maximum  
✓ Every claim traces to user input  
✓ Output is non-reusable (specific to this session)  

If any check fails → QC-5 regenerates with constraint enforcement.

---

## INPUT THINNESS DETECTION

Thin inputs are characterized by:
- Very short length (<10 words per field)
- High abstraction / low specificity
- Generic or template-like language
- Contradiction without observable pattern

When inputs are thin:
- QC-5 must produce proportionally thin output
- QC-5 must make cautious claims only
- QC-5 may use empty strings for reframe fields
- QC-5 must not compensate by inventing depth

This is a safety feature, not a failure mode.

---

## CONTRADICTION HANDLING

If inputs contradict each other (common scenario):
- QC-5 may note the contradiction observationally
- QC-5 must not resolve the contradiction
- QC-5 must not moralize the contradiction
- QC-5 must not frame it as a problem to fix

Contradiction between qc3_influences and qc4_forced_pick is often the most revealing signal.
QC-5 describes what this reveals, not what user should do about it.

---

## FAILURE MODES (DETECTION)

QC-5 has failed if:
- Outputs reference context not in the four inputs
- Outputs sound like advice or recommendations
- Outputs label personality traits or identity
- Outputs resolve contradictions instead of observing them
- Outputs are generic enough to work for other users
- Outputs continue past the JSON boundary
- Outputs compensate for thin inputs with manufactured depth

Invalid outputs must be regenerated.

---

## HANDOFF EXECUTION

```
[User completes QC1-QC4 inputs] 
   ↓
[Input object constructed with session_id and timestamp]
   ↓
[QC-5 receives: complete input object]
   ↓
[QC-5 validates input presence]
   ↓
[QC-5 executes: micro-clarity generation from inputs only]
   ↓
[QC-5 outputs: valid JSON object]
   ↓
[Output validation checks run]
   ↓
[JSON rendered to user]
```

No intermediate analysis.  
No interpretation layer.  
No depth inference.

---

## RELATIONSHIP TO DEEP-DIVE (DM)

Deep-Dive pipeline:
```
User → DM0-DM3 → DM4 (analysis) → DM5 (generation) → Output
```

Quick Clarity pipeline:
```
User → QC1-QC4 → QC-5 (generation) → Output
```

Key differences:
- QC has no analysis layer equivalent to DM4
- QC-5 works with raw user text, not structured analysis
- QC-5 has no themes, tensions, or directional signals
- QC-5 must remain at surface level always
- QC-5 outputs JSON, not prose

QC-5 must never assume DM4-like preprocessing has occurred.

---

## SCOPE BOUNDARIES

QC-5 is designed for:
• Situational micro-clarity
• Surface-level observation
• Small observable truths
• 4-input, single-pass generation

QC-5 is NOT designed for:
• Deep personal insight (use Deep-Dive)
• Multi-session pattern analysis (use Deep-Dive)
• Identity exploration (use Deep-Dive)
• Decision recommendations (use nothing - not FMY's role)

If user inputs suggest need for deeper work, QC-5 does not escalate or suggest alternatives.
QC-5 simply works conservatively within its design constraints.

---

## VERSION CONTROL

Contract modifications require:
- Doctrine alignment check
- Voice discipline audit
- Quality gate validation

Changes to schema structure = major version bump.  
Changes to constraints = minor version bump.

Current: v64.0.0

---

END OF SPECIFICATION
