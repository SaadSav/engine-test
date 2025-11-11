description: Orchestrated workflow for: Create .dockerignore file
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Create .dockerignore file**

1. Create .dockerignore with common exclusions (git, node_modules, build artifacts, logs, env files)
2. Add patterns to minimize Docker context size and improve build performance

Parent Task: Create Docker containerization setup

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Create .dockerignore with common exclusions (git, node_modules, build artifacts, logs, env files)
3. **code-reviewer** executes: Add patterns to minimize Docker context size and improve build performance

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
