FROM node:21-slim

# Install curl
RUN apt-get update \
 && apt-get install -y curl \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

WORKDIR /home/user

# Create Next.js app
RUN npx create-next-app@latest . \
    --yes \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*"

# Initialize shadcn
RUN npx shadcn@latest init --yes -b base --force

# Install all components
RUN npx shadcn@latest add --all --yes