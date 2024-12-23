# Bridge Implementation Plan: Phase Zero

## Project Structure 📁
```
cursor-chronicle/
├── packages/
│   ├── bridge/                 # Our main focus
│   │   ├── src/
│   │   │   ├── correlator/    # Chat-to-code correlation
│   │   │   ├── api/           # Bridge API endpoints
│   │   │   └── types/         # Shared types
│   │   └── package.json
│   │
│   ├── cursor-chat-browser/    # Git submodule
│   └── local-history/         # Git submodule
│
├── docs/
│   ├── BRIDGE_ARCHITECTURE.md
│   └── IMPLEMENTATION_PLAN.md
│
└── package.json               # Workspace configuration
```

## Phase 0: Foundation Setup 🏗️

### 1. Project Initialization
```bash
# Initial setup
mkdir cursor-chronicle
cd cursor-chronicle
git init

# Set up workspace
pnpm init
pnpm add -D typescript @types/node

# Add submodules
git submodule add https://github.com/thomas-pedersen/cursor-chat-browser packages/cursor-chat-browser
git submodule add https://github.com/xyz/local-history packages/local-history

# Create bridge package
mkdir -p packages/bridge
cd packages/bridge
pnpm init
```

### 2. Minimal Bridge Types
```typescript
// packages/bridge/src/types/core.ts

interface BridgeCore {
  // Minimal correlation model
  correlations: {
    link(chatId: string, fileChange: string): Promise<void>;
    find(chatId: string): Promise<string[]>;
    findByChatId(chatId: string): Promise<FileChange[]>;
    findByFileChange(fileChange: string): Promise<Chat[]>;
  };

  // Basic event handling
  events: {
    onChatUpdate(handler: (chat: Chat) => void): void;
    onFileChange(handler: (change: FileChange) => void): void;
  };

  // Simple storage
  storage: {
    saveCorrelation(correlation: Correlation): Promise<void>;
    getCorrelations(filter: Filter): Promise<Correlation[]>;
  };
}
```

### 3. Integration Points

#### A. Chat Browser Integration
```typescript
// packages/bridge/src/integrations/chat.ts

class ChatBrowserIntegration {
  constructor(private chatBrowser: any) {}

  // Listen for new chats
  watchChats(): void {
    // Minimal chat monitoring
  }

  // Get chat history
  async getChats(): Promise<Chat[]> {
    // Basic chat retrieval
  }
}
```

#### B. Local History Integration
```typescript
// packages/bridge/src/integrations/local.ts

class LocalHistoryIntegration {
  constructor(private localHistory: any) {}

  // Watch for file changes
  watchChanges(): void {
    // Minimal change monitoring
  }

  // Get change history
  async getChanges(): Promise<FileChange[]> {
    // Basic change retrieval
  }
}
```

### 4. Simple Correlation Logic
```typescript
// packages/bridge/src/correlator/index.ts

class SimpleCorrelator {
  constructor(
    private chat: ChatBrowserIntegration,
    private local: LocalHistoryIntegration
  ) {}

  // Basic time-based correlation
  async correlate(timeWindow: number): Promise<Correlation[]> {
    const chats = await this.chat.getChats();
    const changes = await this.local.getChanges();
    
    return this.findTimeBasedCorrelations(chats, changes, timeWindow);
  }
}
```

## Initial API Routes 🛣️

### 1. Basic Endpoints
```typescript
// packages/bridge/src/api/routes.ts

export const routes = {
  // Get correlated history
  'GET /api/bridge/correlations': async (req, res) => {
    const correlations = await correlator.getAll();
    res.json(correlations);
  },

  // Link chat to changes
  'POST /api/bridge/correlations': async (req, res) => {
    const { chatId, changeId } = req.body;
    await correlator.link(chatId, changeId);
    res.json({ success: true });
  }
};
```

## Development Process 🔄

1. **Setup Phase**
   - [ ] Initialize monorepo structure
   - [ ] Add submodules
   - [ ] Set up basic bridge package

2. **Core Implementation**
   - [ ] Implement basic types
   - [ ] Create simple integrations
   - [ ] Build correlation logic

3. **Testing**
   - [ ] Test chat browser integration
   - [ ] Test local history integration
   - [ ] Test correlation logic

4. **API Layer**
   - [ ] Implement basic endpoints
   - [ ] Add error handling
   - [ ] Add basic validation

## Success Criteria ✅

### Phase 0 Goals
1. **Minimal Working Bridge**
   - Can detect chats
   - Can detect file changes
   - Can correlate based on time

2. **Basic API**
   - Can query correlations
   - Can manually link items
   - Simple error handling

3. **Clean Architecture**
   - Clear separation of concerns
   - Minimal dependencies
   - Easy to extend

### Metrics for Phase 0
| Metric | Target |
|--------|---------|
| Setup Time | <30 mins |
| Integration Coverage | 80% |
| API Response Time | <100ms |
| Error Rate | <1% |

## Next Phase Preview 🔭

Once Phase 0 is stable, we'll:
1. Add pattern detection
2. Enhance correlation accuracy
3. Improve UI integration
4. Add advanced features

But for now, we stay focused on:
- Clean integration
- Reliable correlation
- Solid foundation

## Development Guidelines 📋

1. **Keep It Simple**
   - Minimal dependencies
   - Clear interfaces
   - Basic functionality first

2. **Focus on Stability**
   - Thorough error handling
   - Reliable correlations
   - Clean state management

3. **Prepare for Extension**
   - Clear extension points
   - Documented interfaces
   - Flexible architecture

## Getting Started 🚀

```bash
# Clone the repository
git clone https://github.com/your-org/cursor-chronicle
cd cursor-chronicle

# Initialize submodules
git submodule update --init --recursive

# Install dependencies
pnpm install

# Start development
cd packages/bridge
pnpm dev
```

This focused approach lets us:
1. Get a working bridge quickly
2. Maintain clean separation
3. Build a solid foundation
4. Prepare for future enhancements

All while keeping our grander vision in sight but not letting it distract from the immediate, practical goal of connecting these two powerful systems. 