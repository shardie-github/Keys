import Link from 'next/link';
import path from 'node:path';
import fs from 'node:fs/promises';

export const runtime = 'nodejs';

export const metadata = {
  title: 'Library',
  description: 'Browse open source prompts, notebooks, and runbooks maintained by Keys.',
};

interface LibraryArtifact {
  slug: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  lastUpdated: string;
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

const parseTags = (raw: string | undefined) => {
  if (!raw) return [];
  const normalized = raw.replace(/^\[|\]$/g, '');
  return normalized
    .split(',')
    .map((tag) => tag.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean);
};

async function loadArtifacts(): Promise<LibraryArtifact[]> {
  for (const baseDir of candidateBaseDirs) {
    const libraryDir = path.join(baseDir, 'docs/library');
    try {
      const entries = await fs.readdir(libraryDir);
      const artifacts = await Promise.all(
        entries
          .filter((entry) => entry.endsWith('.md'))
          .map(async (entry) => {
            const filePath = path.join(libraryDir, entry);
            const contents = await fs.readFile(filePath, 'utf8');
            const { meta } = parseFrontmatter(contents);
            return {
              slug: entry.replace(/\.md$/, ''),
              title: meta.title || entry.replace(/\.md$/, ''),
              description: meta.description || 'No description provided.',
              type: meta.type || 'Artifact',
              tags: parseTags(meta.tags),
              lastUpdated: meta.last_updated || 'Unknown',
            } as LibraryArtifact;
          })
      );
      return artifacts.sort((a, b) => a.title.localeCompare(b.title));
    } catch {
      continue;
    }
  }

  return [];
}

export default async function LibraryPage() {
  const artifacts = await loadArtifacts();

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Library</h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Browse open source artifacts. Each entry includes clear metadata and is meant to be adapted to your tools.
          </p>
        </header>

        {artifacts.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300">
              No artifacts are available yet. Check back soon or contribute a new prompt, notebook, or runbook.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((artifact) => (
              <Link
                key={artifact.slug}
                href={`/library/${artifact.slug}`}
                className="group bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  <span>{artifact.type}</span>
                  <span>{artifact.lastUpdated}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                  {artifact.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{artifact.description}</p>
                {artifact.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {artifact.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
