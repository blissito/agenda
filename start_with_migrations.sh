#!/bin/sh

set -ex
npx prisma generate
npx prisma migrate deploy
npm run start