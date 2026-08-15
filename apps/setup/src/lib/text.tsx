import { Fragment, type ReactNode } from 'react';

// Paper sometimes hard-wraps copy for readability (e.g. "Build strength,
// movement and\noverall fitness.") instead of leaving it to the container
// to reflow — those breaks are authored content, not a side effect of a
// particular column width, so they're preserved verbatim as embedded
// newlines in the source strings and rendered here as literal <br />s
// rather than left to CSS wrapping (which could break at a different
// point once the layout's width changes).
export function withLineBreaks(text: string): ReactNode {
  const lines = text.split('\n');
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}
