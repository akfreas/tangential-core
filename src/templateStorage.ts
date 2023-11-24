import { MongoDBWrapper } from './databaseWrapper';
import { ReportTemplate } from './types/template';


const collectionName = 'report_templates';

// Create a ReportTemplate
export async function createReportTemplate(template: ReportTemplate): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  await templatesCollection.insertOne(template);
}

// Read (Fetch) a ReportTemplate by ID
export async function fetchReportTemplateById(id: string): Promise<ReportTemplate | null> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  return await templatesCollection.findOne({ id });
}

// Update a ReportTemplate
export async function updateReportTemplate(template: ReportTemplate): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  await templatesCollection.updateOne({ id: template.id }, { $set: template });
}

// Delete a ReportTemplate by ID
export async function deleteReportTemplateById(id: string): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  await templatesCollection.deleteOne({ id });
}

// Fetch all ReportTemplates by Owner
export async function fetchAllReportTemplatesByOwner(owner: string): Promise<ReportTemplate[] | null> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  return await templatesCollection.find({ owner }).toArray();
}

// Fetch all ReportTemplates by Owner and Public Templates
export async function fetchAllReportTemplatesByOwnerAndPublic(owner: string): Promise<ReportTemplate[] | null> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);

  // Adding a query to find templates either owned by the specified owner or where isPublic is true
  return await templatesCollection.find({
    $or: [
      { owner },
      { isPublic: true }
    ]
  }).toArray();
}

// Fetch all ReportTemplates by Atlassian Workspace ID
export async function fetchAllReportTemplatesByWorkspaceId(atlassianWorkspaceId: string): Promise<ReportTemplate[] | null> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  return await templatesCollection.find({ atlassianWorkspaceId }).toArray();
}

// Upsert a ReportTemplate
export async function upsertReportTemplate(template: ReportTemplate): Promise<void> {
  const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
  const templatesCollection = dbWrapper.getCollection<ReportTemplate>(collectionName);
  await templatesCollection.updateOne({ id: template.id }, { $set: template }, { upsert: true });
}
