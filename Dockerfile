FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend ./backend
COPY frontend ./frontend

WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "start"]