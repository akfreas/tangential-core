import {
  ChangelogValue,
  IssueComment,
  IssuePriority,
  JiraProfile,
} from './jiraTypes';

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
  id:
    | 'off-track'
    | 'at-risk'
    | 'on-track'
    | 'completed'
    | 'no-due-date'
    | 'no-velocity';
  name: string;
  color: string;
};

export interface Analysis {
  predictedEndDate?: Date;
  predictedOverdue?: boolean;
  state?: AnalysisState;
  summaryText?: string;
}

export interface ReportBuildStatus {
  status: 'pending' | 'success' | 'failure';
  remainingItems: string[];
  startedAt: Date;
  completedAt?: string;
  buildId: string;
}

export interface SummaryText {
  shortSummary: string;
  longSummary: string;
  potentialRisks: string;
  actionNeeded: boolean;
  color: string;
}

export interface TextReport {
  id?: string;
  basedOnBuildId: string;
  text: string;
  generatedDate: Date;
  owner: string;
  templateId: string;
  name: string;
  projectName: string;
  description: string;
}

export interface Report {
  reportType: 'project' | 'epic';
  buildId: string;
  avatar?: string;
  buildStatus: ReportBuildStatus;
  ownerId: string;
  atlassianWorkspaceId: string;
  reportGenerationDate: Date;
  velocity: Velocity;
  analysis?: Analysis;
  remainingPoints: number;
  inProgressPoints: number;
  completedPoints: number;
  totalPoints: number;
  statusName?: string;
  priority?: IssuePriority;
  title: string;
  summary?: SummaryText;
  longRunningDays: number;
  windowStartDate: Date;
  windowEndDate: Date;
}
export interface IssueReport {
  id: string;
  key: string;
  changelogTimeline?: ChangelogTimeline;
  commentsTimeline?: IssueCommentsTimeline;
  assignee?: JiraProfile;
  dueDate?: Date;
}

export interface ProjectReport extends Report {
  lead: JiraProfile;
  epics?: EpicReport[];
  projectKey: string;
}

export interface EpicReport extends Report, IssueReport {
  changelogTimeline: ChangelogTimeline;
  longRunningIssues: LongRunningIssue[];
  childIssues: IssueReport[];
  scopeDeltas: ScopeDelta[];
}

export interface ChangelogTimeline {
  issueKey: string;
  pivotDate: Date;
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
  pivotDate: Date;
  beforeDate: IssueComment[];
  afterDate: IssueComment[];
}
