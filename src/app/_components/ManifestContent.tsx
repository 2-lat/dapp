"use client";

import { type ComponentProps } from "react";
import Markdown from "./Markdown";

export const ManifestContent = (props: Omit<ComponentProps<typeof Markdown>, "children">) => {
  return (
    <Markdown {...props}>
      {`
:::page
## What is Second Latitude?

2.lat is a position.  
A second latitude — quiet, deliberate, and exact.  
It’s a space for builders who don’t sprint, but stand.  
Who don't chase trends, but shape presence.
:::
:::page
## Why we exist

We are tired of the noise.  
Of launches without meaning.  
Of loops without rhythm.  
Of building for metrics, not for meaning.

We return to what matters:  
clarity, rhythm, and quiet work  
that lasts.
:::
:::page
## What we believe

**Standing is harder than running**  
**Stillness is not weakness**  
**Creation is not performance**  
**Depth is the new scale**  
**Builders need space, not speed**

:::
:::page
## Our orientation

Not to the moon — **back** to the moon.

We don't promise success.  
We hold space for those who show up.

:::
:::page
## Who this is for

Those who build quietly.  
Who don’t need followers, but focus.  
Who care more about resonance than reach.  
Who come not to chill — but to continue.`}
    </Markdown>
  );
};
