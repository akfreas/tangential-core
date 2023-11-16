import { EpicReport, ProjectReport } from './types/jiraTypes';
import { doLog, jsonLog } from './logging';
import { MongoDBWrapper } from './databaseWrapper';

export async function storeProjectReport(report: ProjectReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.projectKey) {
      doLog('Error: projectKey is missing in the provided report');
      return;
    }


    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE)
    
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');
    // Storing the report in the database
    await reportsCollection.updateOne(
      { projectKey: report.projectKey, 
        ownerId: report.ownerId,
        atlassianWorkspaceId: report.atlassianWorkspaceId
       }, // filter
      { $set: report }, // update
      { upsert: true } // options: create a new document if no documents match the filter
    );

    console.log(`Successfully stored the report for project: ${report.projectKey}`);
  } catch (error) {
    doLog(`Failed to store the report: ${error}`);
  }
}

export async function storeEpicReport(report: EpicReport): Promise<void> {

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
      { epicKey: report.epicKey, ownerId: report.ownerId }, // filter
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
      ownerId,
      reportType: 'project'
    }).toArray();
    if (!reportsArray || reportsArray.length === 0) {
      doLog('No reports found.');
      return [];
    }

    return reportsArray;
  } catch (error) {
    doLog(`Failed to fetch reports: ${error}`);
    return null;
  }
}

export async function fetchReportByProjectKey(ownerId: string, atlassianWorkspaceId: string, projectKey: string): Promise<ProjectReport | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');
    // Fetching all reports from the database
    const report: ProjectReport | null = await reportsCollection.findOne({
      ownerId,
      projectKey,
      atlassianWorkspaceId
    });
    if (!report) {
      doLog('No report found.');
      return null;
    }

    return report;
  } catch (error) {
    doLog(`Failed to fetch report: ${error}`);
    return null;
  }
}

export async function fetchLatestProjectReportsWithEpics(ownerId: string): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');

    const pipeline = [
      {
        $match: {
          ownerId,
          reportType: 'project'
        }
      },
      {
        $sort: {
          reportGenerationDate: -1
        }
      },
      {
        $group: {
          _id: "$jobId",
          latestReport: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "reports",
          let: { jobId: "$latestReport.jobId" },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ["$jobId", "$$jobId"] },
              { $eq: ["$reportType", "epic"] }
            ]}}},
          ],
          as: "epics"
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ["$latestReport", { epics: "$epics" }] } }
      }
    ];
    

    // Execute the aggregation pipeline
    const latestReportsWithEpics = await reportsCollection.aggregate<ProjectReport>(pipeline).toArray();
    jsonLog("latestReportsWithEpics", latestReportsWithEpics)
    if (!latestReportsWithEpics || latestReportsWithEpics.length === 0) {
      doLog('No latest project reports with epics found.');
      return [];
    }
    
    return latestReportsWithEpics;
  } catch (error) {
    doLog(`Failed to fetch latest project reports with epics: ${error}`);
    return null;
  }
}


export async function fetchLatestProjectReports(ownerId: string): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(process.env.MONGODB_URI, process.env.MONGODB_DATABASE);
    const reportsCollection = dbWrapper.getCollection<ProjectReport>('reports');

    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          ownerId,
          reportType: 'project'
        }
      },
      {
        $sort: {
          reportGenerationDate: -1 // Sorting by date in descending order
        }
      },
      {
        $group: {
          _id: "$jobId", // Grouping by jobId, replace with your unique report key field
          latestReport: { $first: "$$ROOT" } // Taking the first document of each group
        }
      },
      {
        $replaceRoot: { newRoot: "$latestReport" } // Replace the root to return only the report documents
      }
    ];

    // Execute the aggregation pipeline
    const latestReportsArray = await reportsCollection.aggregate<ProjectReport>(pipeline).toArray();

    if (!latestReportsArray || latestReportsArray.length === 0) {
      doLog('No latest reports found.');
      return [];
    }
    
    return latestReportsArray;
  } catch (error) {
    doLog(`Failed to fetch latest reports: ${error}`);
    return null;
  }
}