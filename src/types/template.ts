export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  audience: string;
  text: string;
  owner?: string;
  isPublic: boolean;
  atlassianWorkspaceId?: string;
}