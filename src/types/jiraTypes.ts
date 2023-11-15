import { Document } from "mongodb";

export interface ChangelogEntry {
  issue_id: string;
  key: string;
  changelog: any[];
}



export interface JiraRequestAuth {
  accessToken: string;
  atlassianWorkspaceId: string;
  refreshToken: string;
}
export interface JiraAuthDetails extends JiraRequestAuth {
  atlassianUserId: string;
}

export interface JiraRequestOptions {
  path: string;
  method: string;
  body?: any;
  params?: any;
}

export interface GetByJqlResponse {
  issues: any[];
}

export interface PointsField {
  id: string;
}
export interface AvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}


export interface ChangelogItem {
  field: string;
  fieldtype: string;
  fieldId: string; // New field
  from: string | null;
  fromString: string;
  to: string | null;
  toString: string;
}

export interface ChangelogValue {
  id: string;
  author: JiraProfile;
  created: string;
  items: ChangelogItem[];
}

export interface Changelog {
  self: string; // New field
  nextPage: string; // New field
  maxResults: number; // New field
  startAt: number; // New field
  total: number; // New field
  isLast: boolean; // New field
  values: ChangelogValue[]; // Updated field type
}



export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  timeInStatus?: number;
}

export interface Velocity {
  daily: number;
  total: number;
  window: number;
}


export interface JiraProfile {
  accountId: string;
  avatarUrls: AvatarUrls;
  displayName: string;
}

export type IssueComment = {
  self: string;
  id: string;
  author: JiraProfile;
  renderedBody: string;
  updateAuthor: JiraProfile;
  created: string;
  updated: string;
};

export type AnalysisState = {
  id: string;
  name: string;
  color: string;
};

export interface Analysis {
  predictedEndDate?: string;
  predictedOverdue?: boolean;
  state?: AnalysisState;
  summaryText?: string;
}

export interface IssuePriority {
  iconUrl: string;
  name: string;
  id: string;
}
export interface ReportBuildStatus {
  status: 'pending' | 'success' | 'failure';
  remainingItems: string[];
  startedAt: string;
  completedAt?: string;
}

export interface Report {
  reportType: 'project' | 'epic';
  jobId: string;
  avatar?: string;
  buildStatus: ReportBuildStatus;
  ownerId: string;
  atlassianWorkspaceId: string;
  reportGenerationDate: string;
  velocity: Velocity;
  analysis?: Analysis;
  remainingPoints: number;
  inProgressPoints: number;
  completedPoints: number;
  totalPoints: number;
  statusName?: string;
  priority?: IssuePriority;
  summaryText?: string;
}

export interface ProjectReport extends Document, Report {
  name: string;
  lead: JiraProfile;
  epics?: EpicReport[];
  windowStartDate: string;
  windowEndDate: string;
  projectKey: string;
}

export interface EpicReport extends Report {
  epicKey: string;
  assignee: JiraProfile;
  changelogs: ChangelogValue[];
  longRunningIssues: JiraIssue[];
  childIssues: JiraIssue[];
  summary: string;
  dueDate?: string;
}