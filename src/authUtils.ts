import { JiraAuthDetails, JiraRequestAuth } from "./types/jiraTypes";
import {decodeJwt}  from 'jose';

export function extractFromJiraAuth(auth: JiraRequestAuth): JiraAuthDetails {
  const { sub: atlassianUserId } = decodeJwt(auth.accessToken);
  if (!atlassianUserId) {
    throw new Error('Failed to extract Atlassian user ID from the JWT token');
  }
  return {
    ...auth,
    atlassianUserId
  };
}