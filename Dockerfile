# AlgoTutor backend — multi-stage Docker image with Node + Rust + Go.
# Designed for localhost development: ships full toolchains so user code
# compiles inside the container.

FROM rust:1.81-slim-bookworm AS rust-base
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl git pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ---- Final image ----
FROM rust-base
ENV DEBIAN_FRONTEND=noninteractive

# Install Node 22 (for the HTTP server) and Go 1.23.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update && apt-get install -y --no-install-recommends \
        nodejs \
    && rm -rf /var/lib/apt/lists/*

ARG GO_VERSION=1.23.4
RUN curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" | tar -C /usr/local -xz
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH=/root/go
ENV CARGO_HOME=/root/.cargo
ENV CARGO_TARGET_DIR=/work/backend/runner/rust/target

WORKDIR /work

# Pre-build the Rust runner workspace so dependencies (serde / serde_json)
# are cached in the image. User code only triggers a re-link of main.rs.
COPY backend/runner/rust/Cargo.toml backend/runner/rust/Cargo.lock* ./backend/runner/rust/
COPY backend/runner/rust/src/main.rs ./backend/runner/rust/src/main.rs
RUN cd backend/runner/rust && cargo build --release && cargo build

# Pre-fetch Go stdlib (the Go runner uses no external deps).
COPY backend/runner/go/go.mod ./backend/runner/go/
RUN cd backend/runner/go && go mod download || true

# Copy the rest of the backend source.
COPY backend ./backend
COPY docs/questions ./docs/questions

EXPOSE 9090
CMD ["node", "backend/server.mjs"]
