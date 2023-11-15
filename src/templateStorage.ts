import { MongoDBWrapper } from "./databaseWrapper";
import { doError, doLog } from "./logging";
import { ReportTemplate } from "./types/template";

const templateCollectionName = 'templates';

export async function fetchTemplate(atlassianWorkspaceId: string, templateId: string): Promise<ReportTemplate | undefined | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const templatesCollection = dbWrapper.getCollection<any>(templateCollectionName);
    // Fetching all reports from the database
    const template: ReportTemplate = await templatesCollection.findOne({
      atlassianWorkspaceId,
      templateId
    });
    if (!template) {
      doLog('No template found.');
      return null;
    }

    return template;
  } catch (error) {
    doLog(`Failed to fetch template: ${error}`);
  }
}

export async function fetchAllTemplates(atlassianWorkspaceId: string): Promise<ReportTemplate[]> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const templatesCollection = dbWrapper.getCollection<any>(templateCollectionName);
    // Fetching all reports from the database
    const templates = await templatesCollection.find({
      atlassianWorkspaceId
    }).toArray();
    if (!templates || templates.length === 0) {
      doLog('No templates found.');
      return [];
    }

    return templates;
  } catch (error) {
    if (error instanceof Error) {
      doError(`Failed to fetch templates`, error);
    }
    return [];
  }
}

export async function upsertTemplate(atlassianWorkspaceId: string, template: ReportTemplate): Promise<void> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const templatesCollection = dbWrapper.getCollection<ReportTemplate>(templateCollectionName);
    // Storing the report in the database
    await templatesCollection.updateOne(
      { atlassianWorkspaceId, templateId: template.id }, // filter
      { $set: template }, // update
      { upsert: true } // options: create a new document if no documents match the filter
    );

    console.log(`Successfully stored the template: ${template.id}`);
  } catch (error) {
    doLog(`Failed to store the template: ${error}`);
  }
}

export async function deleteTemplate(atlassianWorkspaceId: string, templateId: string): Promise<void> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const templatesCollection = dbWrapper.getCollection<ReportTemplate>(templateCollectionName);
    // Storing the report in the database
    await templatesCollection.deleteOne(
      { atlassianWorkspaceId, templateId }, // filter
    );

    console.log(`Successfully deleted the template: ${templateId}`);
  } catch (error) {
    doLog(`Failed to delete the template: ${error}`);
  }
}