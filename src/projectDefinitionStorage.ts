import { MongoDBWrapper } from './databaseWrapper';
import { ProjectDefinition } from './types/projectTypes';

const collectionName = 'project_definitions';

// Create a ProjectDefinition
export async function createProjectDefinition(
  definition: ProjectDefinition,
): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  await definitionsCollection.insertOne(definition);
}

// Read (Fetch) a ProjectDefinition by ID
export async function fetchProjectDefinitionById(
  id: string,
): Promise<ProjectDefinition | null> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  return await definitionsCollection.findOne({ id });
}

// Update a ProjectDefinition
export async function updateProjectDefinition(
  definition: ProjectDefinition,
): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  await definitionsCollection.updateOne(
    { id: definition.id },
    { $set: definition },
  );
}

// Delete a ProjectDefinition by ID
export async function deleteProjectDefinitionById(id: string): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  await definitionsCollection.deleteOne({ id });
}

// Fetch all ProjectDefinitions by Owner
export async function fetchAllProjectDefinitionsByOwner(
  owner: string,
): Promise<ProjectDefinition[]> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  return await definitionsCollection.find({ owner }).toArray();
}

// Upsert a ProjectDefinition
export async function upsertProjectDefinition(
  definition: ProjectDefinition,
): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(
    process.env.MONGODB_URI,
    process.env.MONGODB_DATABASE,
  );
  const definitionsCollection =
    dbWrapper.getCollection<ProjectDefinition>(collectionName);
  await definitionsCollection.updateOne(
    { id: definition.id },
    { $set: definition },
    { upsert: true },
  );
}
