# PlantMate CI/CD Guide

This document outlines the Continuous Integration and Continuous Deployment processes for the PlantMate project.

## Branch Strategy

```
main (production) ← staging ← development ← feature branches
```

### Branch Descriptions

1. **main**: Production-ready code only. Protected branch with strict requirements.
2. **staging**: Pre-production environment for final testing before production deployment.
3. **development**: Integration branch where features are merged and tested.
4. **feature branches**: Individual feature development branches (e.g., `enhancement/testing-and-refactoring`).

## Workflow Process

### 1. Feature Development
1. Create a feature branch from `development`
2. Develop your feature
3. Write tests for your feature
4. Ensure all tests pass locally
5. Create a Pull Request to `development`

### 2. Code Review & Integration
1. Automated tests run on all Pull Requests
2. At least one team member must review and approve the PR
3. Once approved, merge to `development`
4. Delete feature branch after merging

### 3. Staging Deployment
1. Periodically merge `development` to `staging`
2. Automated tests run on push to `staging`
3. Manual testing in staging environment
4. Fix any issues found in staging

### 4. Production Deployment
1. Merge `staging` to `main` for production release
2. Automated deployment to production environment
3. Monitor production for issues

## GitHub Actions Workflows

### CI Workflow (`ci.yml`)
- Runs on pushes and pull requests to `development`, `staging`, and `main`
- Executes backend and frontend tests
- Performs code quality checks
- Runs on multiple Node.js versions (14.x and 16.x)

### CD Workflow (`cd.yml`)
- Runs on pushes to `main` and `staging`
- Deploys to staging environment when pushing to `staging` branch
- Deploys to production environment when pushing to `main` branch

### Branch Protection Workflow (`branch-protection.yml`)
- Ensures quality gates for protected branches
- Requires tests to pass before merging
- Requires code review before merging
- Prevents direct commits to protected branches

## Protected Branches

The following branches are protected and require strict adherence to the CI/CD process:

1. **main**
   - Require status checks to pass
   - Require branches to be up to date before merging
   - Require pull request reviews
   - Dismiss stale pull request approvals
   - Require linear history
   - Allow force pushes: false
   - Allow deletions: false

2. **staging**
   - Require status checks to pass
   - Require pull request reviews
   - Require linear history
   - Allow force pushes: false

3. **development**
   - Require status checks to pass
   - Require pull request reviews for merging to `main` or `staging`

## Quality Gates

### Test Requirements
- All backend tests must pass (100% pass rate)
- All frontend tests must pass (100% pass rate)
- Code coverage should be maintained or improved

### Code Quality Requirements
- No high or critical security vulnerabilities
- Code must follow established style guides
- All new code must be reviewed by at least one team member

### Deployment Requirements
- Successful CI pipeline execution
- Approval from designated reviewers
- Manual verification in staging environment (for production releases)

## Environment Variables

For local development and testing, ensure the following environment variables are set:

### Backend (.env file in server directory)
```
MONGO_URI=mongodb://127.0.0.1:27017/plantmate
PORT=7777
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### GitHub Actions Secrets
Configure the following secrets in your GitHub repository settings:
- `MONGODB_URI_STAGING` - MongoDB connection string for staging
- `MONGODB_URI_PRODUCTION` - MongoDB connection string for production
- `JWT_SECRET_STAGING` - JWT secret for staging
- `JWT_SECRET_PRODUCTION` - JWT secret for production
- `HOSTING_PLATFORM_API_KEY` - API key for your hosting platform

## Monitoring & Rollback

### Production Monitoring
- Monitor application logs
- Track error rates and response times
- Set up alerts for critical issues

### Rollback Procedure
1. Identify the problematic commit
2. Revert the merge to `main`
3. Fix the issue in a new feature branch
4. Follow the standard CI/CD process for re-deployment

## Best Practices

### Git Practices
- Use descriptive commit messages following conventional commit style
- Keep commits small and focused
- Rebase feature branches on `development` regularly
- Delete merged branches

### Testing Practices
- Write tests for all new features
- Maintain or improve code coverage
- Run tests locally before pushing
- Use test-driven development (TDD) when possible

### Code Review Practices
- Review code for functionality, readability, and maintainability
- Check for security vulnerabilities
- Ensure tests are adequate
- Provide constructive feedback

## Troubleshooting

### Common CI Issues
1. **Tests failing in CI but passing locally**
   - Check Node.js version compatibility
   - Verify environment variables
   - Ensure database is properly mocked

2. **Deployment failures**
   - Check hosting platform status
   - Verify environment variables/secrets
   - Review deployment logs

3. **Branch protection issues**
   - Ensure all required checks pass
   - Get required number of approvals
   - Make sure branch is up to date with target

### Getting Help
- Check GitHub Actions logs for detailed error messages
- Review recent commits for breaking changes
- Consult team members for code review issues