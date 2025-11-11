description: Orchestrated workflow for: Configure Dependabot for automated dependency scanning
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Configure Dependabot for automated dependency scanning**

1. Create .github/dependabot.yml configuration file
2. Configure npm ecosystem with daily security updates
3. Set security updates to target main branch
4. Configure update schedule and commit message prefix

Parent Task: Implement security best practices and dependency scanning

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Create .github/dependabot.yml configuration file
3. **code-reviewer** executes: Configure npm ecosystem with daily security updates
4. **code-reviewer** executes: Set security updates to target main branch
5. **code-reviewer** executes: Configure update schedule and commit message prefix

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
