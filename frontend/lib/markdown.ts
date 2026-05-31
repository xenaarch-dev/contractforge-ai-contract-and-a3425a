import { readFileSync } from "fs";
import path from "path";

export function readLegalDoc(name: "terms" | "privacy" | "refund"): string {
  const filePath = path.join(process.cwd(), "legal", `${name}.md`);
  return readFileSync(filePath, "utf-8");
}

export function mdToHtml(md: string): string {
  let html = md
    .replace(/^---$/gm, '<hr class="my-6 border-zinc-700" />')
    .replace(/^> (.+)$/gm, '<blockquote class="my-4 border-l-4 border-indigo-500 pl-4 text-zinc-300 italic">$1</blockquote>')
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 mb-2 text-base font-semibold text-zinc-200">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-8 mb-3 text-xl font-bold text-white">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mb-4 text-3xl font-bold text-white">$1</h1>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal text-zinc-300">$2</li>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 mb-1 list-disc text-zinc-300">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-zinc-300 italic">$1</em>');

  html = html.replace(/(<li class="ml-4 mb-1 list-decimal[^>]*>.*?<\/li>\n?)+/gs,
    (match) => `<ol class="my-3 space-y-1">${match}</ol>`);
  html = html.replace(/(<li class="ml-4 mb-1 list-disc[^>]*>.*?<\/li>\n?)+/gs,
    (match) => `<ul class="my-3 space-y-1">${match}</ul>`);

  html = html
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return trimmed;
      return `<p class="mb-3 leading-relaxed text-zinc-300">${trimmed}</p>`;
    })
    .join('\n');

  return html;
}
