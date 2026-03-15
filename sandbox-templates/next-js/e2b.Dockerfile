FROM node:21-slim

# Avoid interactive prompts from npm/next/shadcn
ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1

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
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm

# ── Force root-level structure ───────────────────────────────────────────
# create-next-app may still create src/ regardless of --no-src-dir.
# Move everything out of src/ and force tsconfig paths to "./*".
RUN if [ -d "src" ]; then \
      cp -r src/. . 2>/dev/null || true; \
      rm -rf src; \
    fi

# Ensure tsconfig.json maps @/* to root (never src/)
RUN node -e " \
  const fs = require('fs'); \
  const tc = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8')); \
  tc.compilerOptions.paths = { '@/*': ['./*'] }; \
  fs.writeFileSync('tsconfig.json', JSON.stringify(tc, null, 2)); \
"

# ── Shadcn setup ─────────────────────────────────────────────────────────
# Install all peer dependencies that shadcn UI components import.
# shadcn add in headless Docker mode does NOT auto-install these.
RUN pnpm add clsx tailwind-merge class-variance-authority \
  @radix-ui/react-slot @radix-ui/react-label @base-ui/react \
  cmdk vaul sonner input-otp embla-carousel-react recharts \
  react-day-picker react-resizable-panels next-themes

# Create lib/utils.ts before shadcn touches anything
RUN mkdir -p lib && node -e "\
  const fs = require('fs');\
  fs.writeFileSync('lib/utils.ts',\
    'import { clsx, type ClassValue } from \"clsx\"\n' +\
    'import { twMerge } from \"tailwind-merge\"\n\n' +\
    'export function cn(...inputs: ClassValue[]) {\n' +\
    '  return twMerge(clsx(inputs))\n' +\
    '}\n'\
  );"

# Write components.json explicitly — use tailwind.config.ts (shadcn v2+ expects this)
RUN node -e "\
  const fs = require('fs');\
  const config = {\
    '\$schema': 'https://ui.shadcn.com/schema.json',\
    style: 'default',\
    rsc: true,\
    tsx: true,\
    tailwind: {\
      config: 'tailwind.config.ts',\
      css: 'app/globals.css',\
      baseColor: 'neutral',\
      cssVariables: true,\
      prefix: ''\
    },\
    iconLibrary: 'lucide',\
    aliases: {\
      components: '@/components',\
      utils: '@/lib/utils',\
      ui: '@/components/ui',\
      lib: '@/lib',\
      hooks: '@/hooks'\
    }\
  };\
  fs.writeFileSync('components.json', JSON.stringify(config, null, 2) + '\n');"

# Ensure components/ui directory exists before shadcn tries to write into it
RUN mkdir -p components/ui

# Install all UI components — split into batches to avoid timeouts and surface errors
RUN pnpm dlx shadcn@latest add --yes \
  accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button \
  calendar card carousel checkbox collapsible command context-menu \
  dialog drawer dropdown-menu form

RUN pnpm dlx shadcn@latest add --yes \
  hover-card input input-otp label menubar navigation-menu pagination \
  popover progress radio-group resizable scroll-area select separator \
  sheet skeleton slider sonner switch table tabs textarea \
  toggle toggle-group tooltip

# Verify a key component was installed
RUN ls components/ui/button.tsx && echo "Shadcn components installed successfully"

# ── Additional dependencies ───────────────────────────────────────────────
RUN pnpm add lucide-react framer-motion react-hook-form @hookform/resolvers zod date-fns zustand

# ── Ownership ────────────────────────────────────────────────────────────
RUN chown -R 1000:1000 /home/user /pnpm