"""Keys Knowledge Indexer - Index and extract metadata from knowledge artifacts."""

__version__ = "0.1.0"
__all__ = ["KeysIndexer", "ArtifactExtractor", "KnowledgeArtifact"]

from .indexer import KeysIndexer
from .extractors import ArtifactExtractor
from .models import KnowledgeArtifact
