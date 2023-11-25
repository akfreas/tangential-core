export interface ProjectDefinition {
  jqlQuery: string;
  owner: string;
  name: string;
  description?: string;
  id: string;
  associatedProjectKey?: string;
}
