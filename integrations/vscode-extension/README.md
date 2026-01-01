# Keys VS Code Extension

IDE integration for Keys. Provides automatic context injection, inline suggestions, and failure prevention.

## Features

- **Automatic Context Injection**: Automatically injects file tree, git history, and recent changes into Keys prompts
- **Inline Suggestions**: Like GitHub Copilot, but for prompt generation with failure prevention
- **Pattern Matching**: Warns before repeating known failures
- **Safety Checks**: Automatically checks outputs for security/compliance issues

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from `.vsix` file: `code --install-extension keys-vscode-extension-0.1.0.vsix`
3. Authenticate with Keys API
4. Configure settings (auto-inject, check on save)

## Usage

- Context is automatically injected when you open files
- Use `Keys: Inject Context` command to manually inject context
- Use `Keys: Check Output` command to check AI outputs
- Use `Keys: View Failure Patterns` command to see your institutional memory

## Configuration

- `keys.apiUrl`: Keys API URL (default: https://api.keys.dev)
- `keys.autoInject`: Automatically inject context on file open (default: true)
- `keys.checkOnSave`: Check outputs on save (default: true)

## Requirements

- VS Code 1.74.0 or higher
- Keys Pro+ or Enterprise subscription
- Internet connection for API calls

## Development

```bash
npm install
npm run compile
npm run watch
```

Press F5 to launch extension in new VS Code window.
