# actions

BuilderHub actions and reusable workflows.

## Build and push workflows

Reusable workflows for building and pushing container images. Call them from your repo with `workflow_call`; pass inputs and secrets as shown below.

### Buildah (`buildah-build-push-workflow.yaml`)

**Native multi-arch:** runs on `ubuntu-latest` (amd64) and `ubuntu-22.04-arm` (arm64), then creates a multi-arch manifest. No emulation—each image is built on the target architecture.

```yaml
jobs:
  build:
    uses: builderhub/actions/.github/workflows/buildah-build-push-workflow.yaml@v0.1.0-beta
    with:
      image: myorg/myapp
      tags: latest ${{ github.sha }}
      containerfiles: ./Containerfile
      context: .
      registry: ghcr.io
      push: true   # set false to build only
    secrets:
      REGISTRY_USERNAME: ${{ github.actor }}
      REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
```

### Docker Buildx (`docker-build-push-workflow.yaml`)

**Multi-arch via emulation:** single job on `ubuntu-latest` using QEMU and Docker Buildx. arm64 (and other platforms) are emulated, so builds are slower than native but no ARM runner is required.

```yaml
jobs:
  build:
    uses: builderhub/actions/.github/workflows/docker-build-push-workflow.yaml@v0.1.0-beta
    with:
      image: myorg/myapp
      tags: latest ${{ github.sha }}
      containerfiles: ./Dockerfile
      context: .
      registry: ghcr.io
      platforms: linux/amd64,linux/arm64
      push: true   # set false to build only
    secrets:
      REGISTRY_USERNAME: ${{ github.actor }}
      REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs (both)

| Input         | Required | Default           | Description                          |
|---------------|----------|-------------------|--------------------------------------|
| `image`       | yes      | —                 | Image name (e.g. `owner/repo`)       |
| `tags`        | no       | `latest`          | Space-separated tags                  |
| `containerfiles` | no    | `./Containerfile` | Path(s) to Containerfile/Dockerfile   |
| `context`     | no       | `.`               | Build context path                   |
| `registry`    | yes      | —                 | Registry host (e.g. `ghcr.io`)       |
| `push`        | no       | `true`            | Push to registry; `false` = build only |

Docker workflow also has `platforms` (default `linux/amd64,linux/arm64`).

### Secrets (both)

Pass via `secrets:` when calling the workflow:

- `REGISTRY_USERNAME` — registry login username
- `REGISTRY_PASSWORD` — registry token or password
