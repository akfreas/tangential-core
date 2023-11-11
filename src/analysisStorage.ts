
import { promises as fs } from 'fs';
import { EpicReport, ProjectReport } from './jiraTypes';
import { doLog } from './logging';
import { MongoDBWrapper } from './databaseWrapper';
export async function storeProjectReport(ownerId: string, report: ProjectReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.projectKey) {
      doLog('Error: projectKey is missing in the provided report');
      return;
    }
    const fileName = `./reports/${report.projectKey}.json`;
    try {
      await fs.mkdir('./reports', { recursive: false });
    } catch (error) {
      doLog("Failed to create reports directory: ", error)
    }
    await fs.writeFile(fileName, JSON.stringify(report, null, 2));

    console.log(`Successfully wrote report to file: ${fileName}`);
    

    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE)
    
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');
    // Storing the report in the database
    await reportsCollection.updateOne(
      { projectKey: report.projectKey, ownerId }, // filter
      { $set: report }, // update
      { upsert: true } // options: create a new document if no documents match the filter
    );

    console.log(`Successfully stored the report for project: ${report.projectKey}`);
  } catch (error) {
    doLog(`Failed to store the report: ${error}`);
  }
}

export async function storeEpicReport(ownerId: string, report: EpicReport): Promise<void> {

  try {
    // Validation for essential keys
    if (!report.epicKey) {
      doLog('Error: epicKey is missing in the provided report');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE)
    
    const reportsCollection = dbWrapper.getCollection<EpicReport>('reports');
    // Storing the report in the database
    await reportsCollection.updateOne(
      { epicKey: report.epicKey, ownerId }, // filter
      { $set: report }, // update
      { upsert: true } // options: create a new document if no documents match the filter
    );

    console.log(`Successfully stored the report for epic: ${report.epicKey}`);
  } catch (error) {
    doLog(`Failed to store the report: ${error}`);
  }
}

export async function fetchAllProjectReports(ownerId: string): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');
    // Fetching all reports from the database
    const reportsArray = await reportsCollection.find({
      ownerId
    }).toArray();
    if (!reportsArray || reportsArray.length === 0) {
      doLog('No reports found.');
      return [];
    }

    // let mappedReports: any = {};
    // reportsArray.forEach((report: ProjectReport) => {
    //   mappedReports[report.projectKey] = report;
    // })

    return reportsArray;
  } catch (error) {
    doLog(`Failed to fetch reports: ${error}`);
    return null;
  }
}