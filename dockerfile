# Utiliser une image de base avec Node.js
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copier le fichier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installation de NEST
RUN npm install -g @nestjs/cli

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port sur lequel l'application écoute
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "start:dev"]
