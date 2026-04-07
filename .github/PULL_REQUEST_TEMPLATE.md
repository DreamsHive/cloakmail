## Summary

<!-- One or two sentences describing what this PR does and why. -->

## Type of change

<!-- Mark the relevant box with an x. -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactor / cleanup (no functional change)
- [ ] CI / tooling

## Affected packages

<!-- Mark every package this PR touches. -->

- [ ] `packages/server` (Docker / VPS deployment)
- [ ] `packages/web` (SvelteKit UI)
- [ ] `packages/cloudflare` (Workers + D1 + R2)
- [ ] CI / GitHub workflows
- [ ] Documentation

## Test plan

<!-- How did you verify this works? Include commands run, screenshots, or
     links to deployments. Both deployment paths (Docker and Cloudflare)
     should remain working — call out which one(s) you tested. -->

- [ ] `bun test` passes in every touched package
- [ ] `bun run build` in `packages/web` still produces a working Node build
- [ ] `ADAPTER=cloudflare bun run build` in `packages/web` still produces a working Cloudflare build (if you touched the web package)
- [ ] Manual smoke test against a real deployment (describe below)

## Related issues

<!-- e.g. Closes #123, Related to #456 -->

## Checklist

- [ ] My code follows the existing style of the project
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] I have updated documentation as needed
- [ ] My commits follow the [conventional commits](https://www.conventionalcommits.org/) format
