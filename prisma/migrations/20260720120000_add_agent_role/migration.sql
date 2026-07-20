-- AlterEnum: add AGENT to the Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AGENT';
