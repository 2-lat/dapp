import { Fragment, type ComponentProps } from "react";
import Markdown from "./Markdown";
import { cn } from "@/lib/utils";

export const ManifestContent = ({
  className,
  ...props
}: Omit<ComponentProps<typeof Markdown>, "children"> & {
  className?: string;
}) => {
  return (
    <Markdown>
      {`
## What is Second Latitude?

2.lat is a position.  
A second latitude —  
quiet, deliberate, and exact.

It’s a space for builders who  
don’t sprint, but stand.  
Who don't chase trends,  
but shape presence.

---

## Why we exist

We are tired of the noise.  
Of launches without meaning.  
Of loops without rhythm.  
Of building for metrics, not for meaning.

We return to what matters:  
clarity, rhythm, and quiet work  
that lasts.

---

## What we believe

**Standing is harder than running**  
**Stillness is not weakness**  
**Creation is not performance**  
**Depth is the new scale**  
**Builders need space, not speed**

---

## Our orientation

Not to the moon — **back** to the moon.

We don't promise success.  
We hold space for those who show up.

---

## Who this is for

Those who build quietly.  
Who don’t need followers, but focus.  
Who care more about resonance than reach.  
Who come not to chill — but to continue.`}
    </Markdown>
  );
};
