description: Orchestrated workflow for: Configure ESLint for code linting
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Configure ESLint for code linting**

1. Install ESLint as dev dependency
2. Create .eslintrc.json with recommended JavaScript/TypeScript rules
3. Add lint script to package.json
4. Create .eslintignore to exclude build artifacts and dependencies

Parent Task: Set up CI/CD pipeline with GitHub Actions

# Workflow
This command orchestrates the following agent sequence:

1. **senior-software-engineer** analyzes requirements and current codebase
2. **senior-software-engineer** executes: Install ESLint as dev dependency
3. **code-reviewer** executes: Create .eslintrc.json with recommended JavaScript/TypeScript rules
4. **code-reviewer** executes: Add lint script to package.json
5. **code-reviewer** executes: Create .eslintignore to exclude build artifacts and dependencies

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
