# Utiliser l'image officielle Node.js comme image de base
FROM node:20.14-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le package.json et le package-lock.json
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production

# Copier le reste du code source de l'application
COPY . .

# Installer les dépendances de développement pour TypeScript
RUN npm install --only=development

# Configurer l'environnement
ENV NODE_ENV=production

# Exposer le port sur lequel l'application s'exécute
EXPOSE 3030

# Commande pour lancer l'application avec TypeScript
CMD ["sh", "-c", "npx prisma generate && npx tsx src/server.ts"]