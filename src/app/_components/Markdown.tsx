"use client";

import ReactMarkdown, { type Options } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import type { ComponentProps } from "react";
import { RevealText } from "@/components/RevealText";
import { Page } from "@/components/content/Page";

const _mapProps = (props: ComponentProps<typeof ReactMarkdown>) =>
  ({
    ...props,
    remarkPlugins: [
      remarkMath,
      [remarkGfm, { singleTilde: false }],
      remarkDirective,
      remarkDirectiveRehype,
    ],
    rehypePlugins: [rehypeKatex, rehypeSlug],
    remarkRehypeOptions: {},
    components: {
      page: Page,
      reveal: RevealText,
      math: ({ value }: { value: string }) => <BlockMath>{value}</BlockMath>,
      inlineMath: ({ value }: { value: string }) => (
        <InlineMath renderError={() => null}>{value}</InlineMath>
      ),
    },
  }) as Readonly<Options>;

const Markdown = (props: ComponentProps<typeof ReactMarkdown>) => (
  <ReactMarkdown {..._mapProps(props)} />
);

export default Markdown;
