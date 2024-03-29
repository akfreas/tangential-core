import { doLog } from './logging';
import { MongoDBWrapper } from './databaseWrapper';
import { TextReport } from './types/reportingTypes';

const collectionName = 'text_reports';
export async function storeTextReport(report: TextReport): Promise<void> {
  try {
    // Validation for essential keys
    if (!report.basedOnBuildId || !report.owner) {
      doLog('Error: Essential key(s) missing in the provided TextReport');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<TextReport>(collectionName);
    const id = `${report.owner}_${report.basedOnBuildId}`;
    await reportsCollection.updateOne(
      { id },
      { $set: report },
      { upsert: true },
    );

    doLog(`Successfully stored the TextReport with ID: ${id}`);
  } catch (error) {
    doLog(`Failed to store the TextReport: ${error}`);
  }
}

export async function fetchTextReportById(
  id: string,
): Promise<TextReport | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<TextReport>(collectionName);

    const report: TextReport | null = await reportsCollection.findOne({ id });
    if (!report) {
      doLog('No TextReport found with the given ID.');
      return null;
    }

    return report;
  } catch (error) {
    doLog(`Failed to fetch TextReport: ${error}`);
    return null;
  }
}

export async function updateTextReport(
  id: string,
  text: string,
  name: string,
  description: string,
): Promise<void> {
  try {
    // Validation for essential keys
    if (!id) {
      doLog('Error: ID is missing in the provided TextReport');
      return;
    }

    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<TextReport>(collectionName);

    await reportsCollection.updateOne(
      { id },
      {
        $set: {
          text,
          name,
          description,
        },
      },
      { upsert: true },
    );

    doLog(`Successfully updated the TextReport with ID: ${id}`);
  } catch (error) {
    doLog(`Failed to update the TextReport: ${error}`);
  }
}

export async function fetchTextReportsByOwner(
  owner: string,
): Promise<TextReport[] | null> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<TextReport>(collectionName);

    // Add sort parameter to sort by 'generatedDate' in descending order
    const reports = await reportsCollection
      .find({ owner })
      .sort({ generatedDate: -1 })
      .toArray();
    if (!reports || reports.length === 0) {
      doLog('No TextReports found for the given owner.');
      return [];
    }

    return reports;
  } catch (error) {
    doLog(`Failed to fetch TextReports: ${error}`);
    return null;
  }
}

export async function deleteTextReportById(id: string): Promise<void> {
  try {
    const dbWrapper = await MongoDBWrapper.getInstance(
      process.env.MONGODB_URI,
      process.env.MONGODB_DATABASE,
    );
    const reportsCollection =
      dbWrapper.getCollection<TextReport>(collectionName);

    const deletionResult = await reportsCollection.deleteOne({ id });

    if (deletionResult.deletedCount === 0) {
      doLog(`No TextReport found with ID: ${id} to delete.`);
      return;
    }

    doLog(`Successfully deleted the TextReport with ID: ${id}`);
  } catch (error) {
    doLog(`Failed to delete the TextReport: ${error}`);
  }
}
