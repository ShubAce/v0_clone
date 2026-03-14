FROM node:21-slim

# Avoid interactive prompts
ENV CI=true

# Use a single shared pnpm store for both build-time (root) and runtime (user).
ENV PNPM_STORE_DIR=/pnpm/store

# Install system dependencies
RUN apt-get update \
 && apt-get install -y curl git \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Prepare a shared pnpm store and allow runtime user writes.
RUN mkdir -p /pnpm/store \
 && chmod -R 777 /pnpm

# Copy compile script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

WORKDIR /home/user

# Pin store-dir before any installs so node_modules links are consistent.
RUN pnpm config set store-dir ${PNPM_STORE_DIR} --global

# Create Next.js project
RUN pnpm dlx create-next-app@latest . \
  --yes \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --import-alias "@/*" \
  --use-pnpm

# Initialize shadcn
RUN pnpm dlx shadcn@latest init --yes

# Install all UI components
RUN pnpm dlx shadcn@latest add --all --yes

# Explicitly install common dependencies used by generated apps.
RUN pnpm add lucide-react framer-motion clsx tailwind-merge react-hook-form @hookform/resolvers zod next-themes date-fns zustand

# Ensure runtime user can write project and shared store.
RUN chown -R 1000:1000 /home/user /pnpm