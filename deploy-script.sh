npm install
npm run build
mkdir -p ./apps/api/public/client
cp -r ./apps/client/dist/* ./apps/api/public/client
npm -w @food-trek/api run start:pm2