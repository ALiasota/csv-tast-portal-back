
FROM node:18-alpine



WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]
COPY .env ./.env
COPY prisma ./prisma/

RUN npm i -g prisma

ENV DATABASE_URL='postgresql://postgres:postgres@localhost:5432/mydatabase?schema=public'

RUN npm install

RUN npx prisma generate --schema ./prisma/schema.prisma

COPY . .

RUN npm run build

EXPOSE 3000


ENV JWT_SECRET=${JWT_SECRET}

ENV JWT_LIFETIME=${JWT_LIFETIME}

CMD ["npm", "run", "start:dev"]
