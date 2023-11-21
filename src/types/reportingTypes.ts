import { ChangelogValue, IssueComment, IssuePriority,  JiraProfile } from "./jiraTypes";

export interface Velocity {
  daily: number;
  total: number;
  window: number;
}

export interface LongRunningIssue {
  id: string;
  key: string;
  timeInStatus: number;
}

export type AnalysisState = {
  id: 'off-track' | 'at-risk' | 'on-track' | 'completed' | 'no-due-date' | 'no-velocity';
  name: string;
  color: string;
};

export interface Analysis {
  predictedEndDate?: string;
  predictedOverdue?: boolean;
  state?: AnalysisState;
  summaryText?: string;
}

export interface ReportBuildStatus {
  status: 'pending' | 'success' | 'failure';
  remainingItems: string[];
  startedAt: string;
  completedAt?: string;
  buildId: string;
}



export interface Report {
  reportType: 'project' | 'epic';
  buildId: string;
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
export interface IssueReport {
  id: string;
  key: string;
  changelogTimeline?: ChangelogTimeline;
  commentsTimeline?: IssueCommentsTimeline;
  assignee?: JiraProfile;
  dueDate?: string;
}

export interface ProjectReport extends Report {
  name: string;
  lead: JiraProfile;
  epics?: EpicReport[];
  windowStartDate: string;
  windowEndDate: string;
  projectKey: string;
}

export interface EpicReport extends Report, IssueReport {
  changelogTimeline: ChangelogTimeline;
  longRunningIssues: LongRunningIssue[];
  childIssues: IssueReport[];
  scopeDeltas: ScopeDelta[];
  summary: string;
}

export interface ChangelogTimeline {
  issueKey: string;
  beforeDate: ChangelogValue[];
  afterDate: ChangelogValue[];
  all: ChangelogValue[];
}

export interface ScopeDelta {
  issueKey: string;
  storyPoints: number;
  changingUser: JiraProfile;
}

export interface IssueCommentsTimeline {
  beforeDate: IssueComment[];
  afterDate: IssueComment[];
}