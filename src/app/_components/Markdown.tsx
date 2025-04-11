import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import type { ComponentProps } from "react";

const _mapProps = (props: ComponentProps<typeof ReactMarkdown>) =>
  ({
    ...props,
    remarkPlugins: [remarkMath, [remarkGfm, { singleTilde: false }]],
    rehypePlugins: [rehypeKatex],
    components: {
      math: ({ value }: { value: string }) => <BlockMath>{value}</BlockMath>,
      inlineMath: ({ value }: { value: string }) => (
        <InlineMath>{value}</InlineMath>
      ),
    },
  }) as any;

const Markdown = (props: ComponentProps<typeof ReactMarkdown>) => (
  <ReactMarkdown {..._mapProps(props)} />
);

export default Markdown;
