description: Orchestrated workflow for: Initialize Node.js project with dependencies
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Initialize Node.js project with dependencies**

1. Create package.json with project metadata
2. Add Winston logging library as dependency
3. Add winston-daily-rotate-file for log rotation
4. Add uuid library for correlation ID generation
5. Add express framework for middleware implementation

Parent Task: Add structured logging with Winston or similar

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Create package.json with project metadata
3. **code-reviewer** executes: Add Winston logging library as dependency
4. **code-reviewer** executes: Add winston-daily-rotate-file for log rotation
5. **code-reviewer** executes: Add uuid library for correlation ID generation
6. **code-reviewer** executes: Add express framework for middleware implementation

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
