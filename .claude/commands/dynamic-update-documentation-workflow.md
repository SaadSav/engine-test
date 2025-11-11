description: Orchestrated workflow for: Update documentation
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Update documentation**

1. Update CLAUDE.md with testing commands and setup information
2. Add testing section describing how to run tests and view coverage
3. Document the 80% coverage threshold requirement

Parent Task: Add unit testing framework and initial tests

# Workflow
This command orchestrates the following agent sequence:

1. **documentation-analyst-writer** analyzes requirements and current codebase
2. **documentation-analyst-writer** executes: Update CLAUDE.md with testing commands and setup information
3. **code-reviewer** executes: Add testing section describing how to run tests and view coverage
4. **code-reviewer** executes: Document the 80% coverage threshold requirement

# Agents Orchestrated
- **documentation-analyst-writer**: Technical documentation creation
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
