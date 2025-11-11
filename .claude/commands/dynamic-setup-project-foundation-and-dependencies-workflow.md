description: Orchestrated workflow for: Setup project foundation and dependencies
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Setup project foundation and dependencies**

1. Initialize Node.js/TypeScript project with package.json
2. Install core dependencies: express, winston/pino for logging, dotenv for config
3. Install error tracking SDK (Sentry)
4. Configure TypeScript with tsconfig.json for type safety
5. Create basic directory structure (src/middleware, src/utils, src/config)

Parent Task: Add error handling and logging infrastructure

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Initialize Node.js/TypeScript project with package.json
3. **code-reviewer** executes: Install core dependencies: express, winston/pino for logging, dotenv for config
4. **code-reviewer** executes: Install error tracking SDK (Sentry)
5. **code-reviewer** executes: Configure TypeScript with tsconfig.json for type safety
6. **code-reviewer** executes: Create basic directory structure (src/middleware, src/utils, src/config)

# Agents Orchestrated
- **senior-software-engineer**: Primary implementation and coding
- **code-reviewer**: Quality assurance and code review

**Note**: This command coordinates the agents - it doesn't do the implementation itself.
Each agent brings their specialized expertise to their part of the workflow.

# Artifacts
- Implementation code (from implementation agent)
- Tests (from implementation agent)
- Code review notes (from code-reviewer)
- Documentation updates (if applicable)

# Execution
The workflow runs agents in sequence, with each agent's output feeding into the next step.
Review checkpoints occur between major phases to ensure quality.
