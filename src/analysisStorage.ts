import { doLog, jsonLog } from './logging';
import { MongoDBWrapper } from './databaseWrapper';
import { EpicReport, ProjectReport } from './types/reportingTypes';

const collectionId = 'reports';

export async function storeProjectReport(report: ProjectReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.projectKey) {
      doLog('Error: projectKey is missing in the provided report');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );

    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);
    // Storing the report in the database
    await reportsCollection.updateOne(
      {
        projectKey: report.projectKey,
        ownerId: report.ownerId,
        atlassianWorkspaceId: report.atlassianWorkspaceId,
      }, // filter
      { $set: report }, // update
      { upsert: true }, // options: create a new document if no documents match the filter
    );

    doLog(`Successfully stored the report for project: ${report.projectKey}`);
  } catch (error) {
    doLog(`Failed to store the report: ${error}`);
  }
}

export async function storeEpicReport(report: EpicReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.key) {
      doLog('Error: key is missing in the provided report');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );

    const reportsCollection = dbWrapper.getCollection<EpicReport>(collectionId);
    // Storing the report in the database
    await reportsCollection.updateOne(
      { key: report.key, ownerId: report.ownerId }, // filter
      { $set: report }, // update
      { upsert: true }, // options: create a new document if no documents match the filter
    );

    doLog(`Successfully stored the report for epic: ${report.key}`);
  } catch (error) {
    doLog(`Failed to store the report: ${error}`);
  }
}

export async function fetchAllProjectReports(
  ownerId: string,
): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);
    // Fetching all reports from the database
    const reportsArray = await reportsCollection
      .find({
        ownerId,
        reportType: 'project',
      })
      .toArray();
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

export async function fetchReportByProjectKey(
  ownerId: string,
  atlassianWorkspaceId: string,
  projectKey: string,
): Promise<ProjectReport | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);
    // Fetching all reports from the database
    const report: ProjectReport | null = await reportsCollection.findOne({
      ownerId,
      projectKey,
      atlassianWorkspaceId,
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

export async function fetchReportByBuildId(
  ownerId: string,
  buildId: string,
): Promise<ProjectReport | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);

    const pipeline = [
      {
        $match: {
          ownerId,
          buildId,
          reportType: 'project',
        },
      },
      {
        $lookup: {
          from: 'reports',
          let: { reportBuildId: '$buildId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$buildId', '$$reportBuildId'] },
                    { $eq: ['$reportType', 'epic'] },
                  ],
                },
              },
            },
          ],
          as: 'epics',
        },
      },
      { $limit: 1 }, // Since we are expecting only one report
    ];

    // Execute the aggregation pipeline
    const reportWithEpics = await reportsCollection
      .aggregate<ProjectReport>(pipeline)
      .toArray();

    if (!reportWithEpics || reportWithEpics.length === 0) {
      doLog('No report with the specified buildId found.');
      return null;
    }

    return reportWithEpics[0];
  } catch (error) {
    doLog(`Failed to fetch report: ${error}`);
    return null;
  }
}

export async function updateReport(report: ProjectReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.projectKey) {
      doLog('Error: projectKey is missing in the provided report');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );

    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);
    // Storing the report in the database
    await reportsCollection.updateOne(
      {
        projectKey: report.projectKey,
        ownerId: report.ownerId,
        atlassianWorkspaceId: report.atlassianWorkspaceId,
      }, // filter
      { $set: report }, // update
      { upsert: true }, // options: create a new document if no documents match the filter
    );

    doLog(`Successfully updated the report for project: ${report.projectKey}`);
  } catch (error) {
    doLog(`Failed to update the report: ${error}`);
  }
}

export async function fetchLatestProjectReportsWithEpics(
  ownerId: string,
): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);

    const pipeline = [
      {
        $match: {
          ownerId,
          reportType: 'project',
        },
      },
      {
        $sort: {
          reportGenerationDate: -1,
        },
      },
      {
        $group: {
          _id: '$buildId',
          latestReport: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'reports',
          let: { buildId: '$latestReport.buildId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$buildId', '$$buildId'] },
                    { $eq: ['$reportType', 'epic'] },
                  ],
                },
              },
            },
          ],
          as: 'epics',
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$latestReport', { epics: '$epics' }] },
        },
      },
    ];

    // Execute the aggregation pipeline
    const latestReportsWithEpics = await reportsCollection
      .aggregate<ProjectReport>(pipeline)
      .toArray();
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

export async function fetchLatestProjectReports(
  ownerId: string,
): Promise<ProjectReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<ProjectReport>(collectionId);

    // Define the aggregation pipeline
    const pipeline = [
      {
        $match: {
          ownerId,
          reportType: 'project',
        },
      },
      {
        $sort: {
          reportGenerationDate: -1, // Sorting by date in descending order
        },
      },
      {
        $group: {
          _id: '$buildId', // Grouping by buildId, replace with your unique report key field
          latestReport: { $first: '$$ROOT' }, // Taking the first document of each group
        },
      },
      {
        $replaceRoot: { newRoot: '$latestReport' }, // Replace the root to return only the report documents
      },
    ];

    // Execute the aggregation pipeline
    const latestReportsArray = await reportsCollection
      .aggregate<ProjectReport>(pipeline)
      .toArray();

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
