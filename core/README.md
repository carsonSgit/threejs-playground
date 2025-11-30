# Three.js Playground - AI Assistant

A Botpress AI agent that powers the webchat assistant for the Three.js Playground project.

## Getting Started

1. Install dependencies:

   ```bash
   cd core && pnpm install
   ```

2. Start development server:

   ```bash
   pnpm dev
   ```

3. Deploy your agent:
   ```bash
   pnpm deploy
   ```

## Project Structure

- `src/conversations/` - Conversation handler with Three.js context
- `src/actions/` - Custom callable functions (extend as needed)
- `src/workflows/` - Long-running processes
- `src/knowledge/` - Knowledge base files

## Learn More

- [ADK Documentation](https://botpress.com/docs/adk)
- [Three.js Documentation](https://threejs.org/docs/)
