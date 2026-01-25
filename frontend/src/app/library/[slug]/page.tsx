import path from 'node:path';
import fs from 'node:fs/promises';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';

interface ArtifactFrontmatter {
  title?: string;
  description?: string;
  type?: string;
  tags?: string;
  last_updated?: string;
}

const candidateBaseDirs = [process.cwd(), path.join(process.cwd(), '..')];

const parseFrontmatter = (contents: string) => {
  const match = contents.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { meta: {}, body: contents };
  }

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [key, ...rest] = trimmed.split(':');
    if (!key || rest.length === 0) continue;
    meta[key.trim()] = rest.join(':').trim().replace(/^"(.*)"$/, '$1');
  }

  return { meta, body: contents.slice(match[0].length) };
};

async function readArtifact(slug: string) {
  for (const baseDir of candidateBaseDirs) {
    const filePath = path.join(baseDir, 'docs/library', `${slug}.md`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      return { meta: meta as ArtifactFrontmatter, body };
    } catch {
      continue;
    }
  }

  return null;
}

export default async function LibraryArtifactPage({ params }: { params: { slug: string } }) {
  const artifact = await readArtifact(params.slug);
  if (!artifact) {
    notFound();
  }

  const { meta, body } = artifact;
  const html = marked.parse(body);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {meta.type || 'Artifact'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {meta.title || params.slug}
          </h1>
          {meta.description && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{meta.description}</p>
          )}
          {meta.last_updated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {meta.last_updated}</p>
          )}
        </header>
        <article
          className="prose prose-slate dark:prose-invert max-w-none bg-white/70 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 shadow-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
