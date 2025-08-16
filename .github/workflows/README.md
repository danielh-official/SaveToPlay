# GitHub Workflows

This directory contains GitHub Actions workflows for the SaveToPlay project.

## Test Branch Protection Rules

**File:** `test-branch-protection.yml`

This workflow tests your branch protection rules by attempting to commit directly to the main branch. It's designed to verify that your branch protection settings are working correctly.

### How it works:

1. **Creates a test file** with a timestamp
2. **Attempts to commit directly** to the main branch
3. **Checks the result** - if the commit fails, protection is working
4. **Cleans up** by removing the test file (if it was created)
5. **Reports the outcome** - PASS if blocked, FAIL if allowed

### Triggers:

- **Manual**: Use the "Run workflow" button in the Actions tab
- **Scheduled**: Runs automatically every day at 2 AM UTC

### Expected behavior:

✅ **If branch protection is working correctly:**
- The workflow will fail at the "Attempt direct commit to main" step
- You'll see "Branch protection test PASSED" in the logs
- No test file will be created on main

❌ **If branch protection is NOT working:**
- The workflow will succeed and create a test file on main
- You'll see "Branch protection test FAILED" in the logs
- The test file will be created and then cleaned up

### Usage:

1. **Manual test**: Go to Actions → Test Branch Protection Rules → Run workflow
2. **Check results**: Review the workflow run logs
3. **Verify protection**: Ensure the test shows "PASSED"

### Security note:

This workflow uses the default `GITHUB_TOKEN` which respects your repository's branch protection rules. If the workflow succeeds in committing to main, it indicates a security issue with your branch protection configuration.

### Troubleshooting:

- **Workflow fails immediately**: Check that your repository has Actions enabled
- **Permission denied**: Ensure the workflow has write permissions to the repository
- **Always succeeds**: Review your branch protection rules in Settings → Branches
