description: Orchestrated workflow for: Initialize Node.js project with security dependencies
argument-hint: "<task_path>"
---
# Context
This workflow command was dynamically created to orchestrate agents for:

**Initialize Node.js project with security dependencies**

1. Create package.json with project metadata
2. Add security audit npm scripts (audit, audit:fix, security-check)
3. Install Snyk CLI as dev dependency
4. Create .nvmrc for Node.js version management

Parent Task: Implement security best practices and dependency scanning

# Workflow
This command orchestrates the following agent sequence:

1. **code-reviewer** analyzes requirements and current codebase
2. **code-reviewer** executes: Create package.json with project metadata
3. **risk-auditor** executes: Add security audit npm scripts (audit, audit:fix, security-check)
4. **senior-software-engineer** executes: Install Snyk CLI as dev dependency
5. **senior-software-engineer** executes: Create .nvmrc for Node.js version management
6. **code-reviewer** reviews implementation for quality and best practices

# Agents Orchestrated
- **code-reviewer**: Quality assurance and code review
- **risk-auditor**: Security and risk assessment
- **senior-software-engineer**: Primary implementation and coding

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
