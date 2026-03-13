# ContextRecall

Smart memory system for OpenClaw agents. Auto-captures session summaries, retrieves relevant context based on queries, and manages tiered memory storage.

## Features

- **Auto-capture**: Session summaries generated automatically
- **Semantic search**: Find relevant memories with local TF-IDF
- **Tiered storage**: Daily → Weekly → Monthly archival
- **Zero dependencies**: Pure Node.js, no external APIs
- **Privacy first**: All data stays local

## Installation

```bash
# Via skillhub
skillhub install context-recall

# Or manual
cd /mnt/skills
ln -s /path/to/context-recall context-recall
```

## Usage

### Commands

```bash
# Initialize session (run on startup)
recall-init --query="user's first message"

# Search memories
recall-search "what were we working on"

# Capture important info
recall-capture --type=decision --content="Use SQLite"
recall-capture --type=preference --content="Prefers concise"
recall-capture --type=task --content="Review PR by Friday"

# List tasks
recall-tasks

# End session (run on shutdown)
recall-end --log=/path/to/session-log.json
```

### Integration with AGENTS.md

Add to your AGENTS.md:

```markdown
## Session Startup

1. Run `recall-init --query="$USER_FIRST_MESSAGE"`
2. Read relevant memories from output

## Session End

1. Save session log to `memory/session-logs/`
2. Run `recall-end --log=<file>`
```

## Storage Structure

```
memory/
├── daily/              # Daily summaries
├── weekly/             # Weekly aggregates
├── monthly/            # Monthly archives
├── ontology/           # Structured knowledge
│   ├── preferences.json
│   ├── tasks.json
│   └── projects.json
├── index.json          # Search index
└── context-recall/
    └── config.yaml     # Configuration
```

## Configuration

Edit `memory/context-recall/config.yaml`:

```yaml
retrieval:
  max_results: 5
  similarity_threshold: 0.7

storage:
  compress_after_days: 7
  archive_after_days: 30

auto_capture:
  decisions: true
  preferences: true
  tasks: true
```

## License

MIT
