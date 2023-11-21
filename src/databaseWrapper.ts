import {
  MongoClient, Db, Collection,
  OptionalUnlessRequiredId, InsertOneResult,
  ServerApiVersion, Document
} from 'mongodb';
import { doLog, jsonLog } from './logging';

export class MongoDBWrapper {
  private static instance: MongoDBWrapper;
  private client?: MongoClient;
  public db?: Db;

  private databaseUrl: string;
  private databaseName: string;

  private constructor(url: string, database: string) {
    this.databaseUrl = url;
    this.databaseName = database;
  }

  

  public static async getInstance(url?: string, database?: string): Promise<MongoDBWrapper> {

    if (!url || !database) {
      throw new Error('MongoDBWrapper.getInstance() requires url and database parameters');
    }


    if (!this.instance) {
      this.instance = new MongoDBWrapper(url, database);
      await this.instance.connect();
    }
    return this.instance;
  }

  private async connect(): Promise<void> {
    try {

      let options = {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      }
      // console.log('Connecting to MongoDB...', url);
      // if (process.env.LOCAL_HTTP_PROXY) {
      //   options = {
      //     ...options,
      //     ...{
      //       proxyHost: process.env.LOCAL_HTTP_PROXY.split(':')[0],
      //       proxyPort: parseInt(process.env.LOCAL_HTTP_PROXY.split(':')[2])
      //     },
      //   }
      // }
      this.client = new MongoClient(this.databaseUrl, options);
      this.db = this.client.db(this.databaseName); // You can specify a database name here if needed
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  public getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database connection not established');
    }

    return this.db.collection<T>(name);
  }

  public async storeDocument<T extends Document>(collection: Collection<T>, document: OptionalUnlessRequiredId<T>): Promise<void> {
    const result: InsertOneResult<T> = await collection.insertOne(document);
    if (result.acknowledged !== true) {
      throw new Error(`Failed to insert document into collection ${collection.collectionName}`);
    }
  }
}