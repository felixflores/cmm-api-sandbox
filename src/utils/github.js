const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  async getProjectIssues(owner, repo, projectNumber) {
    try {
      // Get project ID from project number
      const { data: projects } = await this.octokit.rest.projects.listForRepo({
        owner,
        repo
      });

      const project = projects.find(p => p.number === projectNumber);
      if (!project) {
        throw new Error(`Project #${projectNumber} not found`);
      }

      // Get project columns
      const { data: columns } = await this.octokit.rest.projects.listColumns({
        project_id: project.id
      });

      // Get cards from all columns
      const allCards = [];
      for (const column of columns) {
        const { data: cards } = await this.octokit.rest.projects.listCards({
          column_id: column.id
        });
        
        for (const card of cards) {
          if (card.content_url && card.content_url.includes('/issues/')) {
            const issueNumber = parseInt(card.content_url.split('/').pop());
            const { data: issue } = await this.octokit.rest.issues.get({
              owner,
              repo,
              issue_number: issueNumber
            });
            
            allCards.push({
              id: card.id,
              column: column.name,
              issue: {
                number: issue.number,
                title: issue.title,
                body: issue.body,
                state: issue.state,
                labels: issue.labels,
                assignees: issue.assignees,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                url: issue.html_url
              }
            });
          }
        }
      }

      return allCards;
    } catch (error) {
      throw new Error(`Failed to fetch project issues: ${error.message}`);
    }
  }

  async getRepositoryIssues(owner, repo, options = {}) {
    try {
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: options.state || 'open',
        labels: options.labels,
        assignee: options.assignee,
        sort: options.sort || 'created',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30
      });

      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        url: issue.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to fetch repository issues: ${error.message}`);
    }
  }

  async getIssue(owner, repo, issueNumber) {
    try {
      const { data: issue } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });

      return {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        url: issue.html_url
      };
    } catch (error) {
      throw new Error(`Failed to fetch issue #${issueNumber}: ${error.message}`);
    }
  }
}

module.exports = GitHubService;