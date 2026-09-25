-- Preserve existing happiness-like requirements while adding minimum level.
ALTER TABLE "Evolution" RENAME COLUMN "minValue" TO "minHappy";
ALTER TABLE "Evolution" ADD COLUMN "minLevel" INTEGER;
