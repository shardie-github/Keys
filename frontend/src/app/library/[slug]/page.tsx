import path from 'node:path';
import fs from 'node:fs/promises';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';

interface ArtifactMetadata {
  id: string;
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  tools_supported: string[];
  updated_at?: string;
  content_path: string;
  license?: string;
  safety_notes?: string;
}

interface IndexFileShape {
  artifacts: ArtifactMetadata[];
}

const candidateBaseDirs = [process.cwd(), path.join(process.cwd(), '..')];

async function loadIndex(): Promise<ArtifactMetadata[] | null> {
  const indexPath = path.join(process.cwd(), 'public', 'keys-index.json');
  try {
    const raw = await fs.readFile(indexPath, 'utf8');
    const parsed = JSON.parse(raw) as IndexFileShape;
    return parsed.artifacts ?? null;
  } catch {
    return null;
  }
}

async function loadMetadataForSlug(slug: string): Promise<ArtifactMetadata | null> {
  for (const baseDir of candidateBaseDirs) {
    const metadataPath = path.join(baseDir, 'docs/library', `${slug}.metadata.json`);
    try {
      const raw = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(raw) as ArtifactMetadata;
    } catch {
      continue;
    }
  }
  return null;
}

async function resolveContentPath(contentPath: string): Promise<string | null> {
  for (const baseDir of candidateBaseDirs) {
    const candidate = path.join(baseDir, contentPath);
    try {
      await fs.stat(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

async function resolveFallbackContent(slug: string): Promise<string | null> {
  for (const baseDir of candidateBaseDirs) {
    const filePath = path.join(baseDir, 'docs/library', `${slug}.md`);
    try {
      await fs.stat(filePath);
      return filePath;
    } catch {
      continue;
    }
  }
  return null;
}

async function readArtifact(slug: string) {
  const indexArtifacts = await loadIndex();
  let metadata = indexArtifacts?.find((artifact) => artifact.id === slug || artifact.content_path.includes(slug)) ?? null;

  if (!metadata) {
    metadata = await loadMetadataForSlug(slug);
  }

  let contentFile: string | null = null;
  if (metadata) {
    contentFile = await resolveContentPath(metadata.content_path);
  }

  if (!contentFile) {
    contentFile = await resolveFallbackContent(slug);
  }

  if (!contentFile) {
    return null;
  }

  const body = await fs.readFile(contentFile, 'utf8');

  return {
    metadata,
    body,
  };
}

export default async function LibraryArtifactPage({ params }: { params: { slug: string } }) {
  const artifact = await readArtifact(params.slug);
  if (!artifact) {
    notFound();
  }

  const { metadata, body } = artifact;
  const html = marked.parse(body);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {metadata?.categories?.[0] ?? 'Artifact'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {metadata?.title ?? params.slug}
          </h1>
          {metadata?.description && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{metadata.description}</p>
          )}
          {metadata?.updated_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(metadata.updated_at).toLocaleDateString()}
            </p>
          )}
          {metadata?.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {metadata?.tools_supported?.length ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">Tools: {metadata.tools_supported.join(', ')}</p>
          ) : null}
          {metadata?.safety_notes && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-400/40 dark:bg-amber-900/20 dark:text-amber-100">
              <strong className="mr-2">Safety note:</strong>
              {metadata.safety_notes}
            </div>
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
