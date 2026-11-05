import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { Copy, Check } from 'lucide-react';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownViewer({ content = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      Prism.highlightAllUnder(containerRef.current);

      // Add copy buttons to pre blocks if not already added
      const preElements = containerRef.current.querySelectorAll('pre');
      preElements.forEach((pre) => {
        if (pre.querySelector('.code-copy-btn')) return;

        pre.style.position = 'relative';
        const button = document.createElement('button');
        button.className =
          'code-copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded bg-[#1D232B] text-[#F3F4F6] border border-[#4F5561] hover:bg-[#303945] transition flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer';
        button.innerHTML = `<span>Copy</span>`;

        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const code = pre.querySelector('code')?.innerText || pre.innerText;
          navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = `<span>Copied!</span>`;
            setTimeout(() => {
              button.innerHTML = `<span>Copy</span>`;
            }, 2000);
          });
        });

        pre.appendChild(button);
      });
    }
  }, [content]);

  const html = marked.parse(content || '*No content provided yet.*');

  return (
    <div
      ref={containerRef}
      className="prose-devpath overflow-x-auto w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
