description: Orchestrated workflow for: Configure Winston logger with structured output
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Configure Winston logger with structured output**

1. Create src/logger/config.js with Winston configuration
2. Configure multiple transports (console, file, error file)
3. Set up log levels (debug, info, warn, error)
4. Configure JSON formatting for structured logs
5. Add timestamp and metadata to log entries

Parent Task: Add structured logging with Winston or similar

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Create src/logger/config.js with Winston configuration
3. **code-reviewer** executes: Configure multiple transports (console, file, error file)
4. **code-reviewer** executes: Set up log levels (debug, info, warn, error)
5. **code-reviewer** executes: Configure JSON formatting for structured logs
6. **code-reviewer** executes: Add timestamp and metadata to log entries

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
