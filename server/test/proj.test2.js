const { fetchGitHubRepos } = require('../src/services/projectService');
const axios = require('axios');
const prisma = require('./prisma');

jest.mock('axios');

describe('fetchGitHubRepos', () => {
  const userId = 'user-123';
  const mockToken = 'gho_testToken';

  beforeEach(async () => {
    await prisma.user.create({
      data: {
        id: userId,
        email: 'test@example.com',
        githubAccessToken: mockToken
      }
    });
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should fetch repositories with valid token', async () => {
    // Mock GitHub API response
    axios.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'repo1',
          html_url: 'https://github.com/user/repo1',
          stargazers_count: 10
        }
      ]
    });

    const repos = await fetchGitHubRepos(userId);
    expect(repos).toEqual([
      {
        id: 1,
        name: 'repo1',
        fullName: undefined, // Adjust based on your transform logic
        htmlUrl: 'https://github.com/user/repo1',
        stars: 10
      }
    ]);
  });

  it('should throw error for invalid token', async () => {
    axios.get.mockRejectedValue({
      response: { status: 401 }
    });

    await expect(fetchGitHubRepos(userId)).rejects.toThrow(
      'GitHub authentication failed'
    );
  });
});