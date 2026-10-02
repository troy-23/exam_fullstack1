# Interface design

The dashboard uses a calm blue palette, clear task content, and a compact set of controls. Its main journey is to create a task, understand its priority, complete it, and review progress.

## Skill applied

The refinement used [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), including its quick reference, productivity-tool search, touch-spacing guidance, and React focus/label guidance.

The product search matched **Productivity Tool**, recommending flat design, small interaction feedback, and functional color. The generated system also included landing-page suggestions, which do not fit this existing task dashboard. The implementation retains the established blue identity and self-hosted Manrope font. The skill is a development aid, not a runtime dependency; no additional frontend packages were needed.

## Decisions implemented

| Area           | Decision                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hierarchy      | Larger page and task headings; a dark completion card separates progress from task counts. Supporting copy describes actions and sorting.                    |
| Typography     | A 16px base with relative units; task text and inputs use 1rem. Metadata starts at 0.75rem rather than the former 8–11px labels.                             |
| Color          | Shared surface, text, primary, success, warning, and danger tokens in `frontend/styles/base.css`. Priority and status always have text labels.               |
| Controls       | Buttons and priority options have at least 44px touch areas, with 8px gaps between adjacent actions. Delete has a visible label.                             |
| Forms          | Persistent labels, explicit optional/required indicators, visible input boundaries, focus rings, and inline error associations. Drafts survive failed saves. |
| Small screens  | The workspace stacks naturally; narrow task panels give each filter its own column with the count beneath. Long task text wraps.                             |
| Larger screens | A sidebar and separate form column provide structure. The form is sticky only when the viewport is tall enough for the normal-size panel.                    |
| Feedback       | Success notices sit in document flow so a fixed banner cannot cover form controls. The polite live region remains available without taking focus.            |
| Motion         | Short color transitions and a transform-based progress indicator; reduced-motion preferences disable visible animation.                                      |

## Implementation boundaries

`base.css` owns the shared design tokens. Layout, task content, forms, feedback, and responsive rules stay in their existing separate files. Task row layout responds to the panel's width through a container query, so it works both in the full-width list and alongside the desktop form.

The interface remains a light-theme web application. Native-app recommendations about platform gestures, haptics, and dark mode were not applicable. The 44px target is a deliberate comfort standard for this project, not a claim that WCAG requires that size for all web controls.

## Review coverage

Browser checks cover the main task workflow, seven viewport widths, control dimensions, 200% text sizing, landscape layout, reduced motion, and automated contrast/accessibility checks. These checks supplement visual review; they do not replace testing with assistive technologies or physical devices.
