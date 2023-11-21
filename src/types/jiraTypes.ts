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
export interface ProjectInfo {
  id: string;
  key: string;
  name: string;
  displayName?: string;
  avatarUrls: any;
  active: boolean;
  lead: JiraProfile;
}

export interface ChangelogItem {
  field: string;
  fieldtype: string;
  fieldId: string; 
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
  self: string; 
  nextPage: string; 
  maxResults: number; 
  startAt: number; 
  total: number; 
  isLast: boolean; 
  values: ChangelogValue[];
}

export interface JiraProfile {
  accountId: string;
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

export interface IssuePriority {
  iconUrl: string;
  name: string;
  id: string;
}
