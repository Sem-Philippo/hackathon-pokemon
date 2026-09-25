-- CreateTable
CREATE TABLE "Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speciesId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "baseExperience" INTEGER,
    "height" INTEGER,
    "weight" INTEGER,
    "hp" INTEGER,
    "attack" INTEGER,
    "defense" INTEGER,
    "specialAttack" INTEGER,
    "specialDefense" INTEGER,
    "speed" INTEGER,
    "type1" TEXT,
    "type2" TEXT,
    "form" TEXT,
    "baseForm" INTEGER,
    "evolvesFromSpecies" INTEGER,
    "isBaby" BOOLEAN,
    "isLegendary" BOOLEAN,
    "isMythical" BOOLEAN,
    "growthRate" TEXT,
    "genderRate" INTEGER,
    "cryFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Evolution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromPokemonId" INTEGER NOT NULL,
    "toPokemonId" INTEGER NOT NULL,
    "item" TEXT,
    "trigger" TEXT,
    "gender" INTEGER,
    "heldItem" TEXT,
    "minValue" INTEGER,
    "timeOfDay" TEXT,
    CONSTRAINT "Evolution_fromPokemonId_fkey" FOREIGN KEY ("fromPokemonId") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evolution_toPokemonId_fkey" FOREIGN KEY ("toPokemonId") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Pokemon_speciesId_idx" ON "Pokemon"("speciesId");

-- CreateIndex
CREATE INDEX "Pokemon_baseForm_idx" ON "Pokemon"("baseForm");

-- CreateIndex
CREATE INDEX "Pokemon_form_idx" ON "Pokemon"("form");

-- CreateIndex
CREATE INDEX "Evolution_fromPokemonId_idx" ON "Evolution"("fromPokemonId");

-- CreateIndex
CREATE INDEX "Evolution_toPokemonId_idx" ON "Evolution"("toPokemonId");
