description: Orchestrated workflow for: Create base project structure with Node.js configuration
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Create base project structure with Node.js configuration**

1. Initialize package.json with basic project metadata
2. Add npm scripts for test, lint, and build commands
3. Create minimal .gitignore for Node.js projects

Parent Task: Set up CI/CD pipeline with GitHub Actions

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Initialize package.json with basic project metadata
3. **code-reviewer** executes: Add npm scripts for test, lint, and build commands
4. **code-reviewer** executes: Create minimal .gitignore for Node.js projects

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
