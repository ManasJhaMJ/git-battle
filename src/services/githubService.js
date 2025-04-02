// githubService.js
const API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const fetchUserData = async (username) => {
  try {
    // Create headers with your auth token
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Fetch user profile
    const userResponse = await fetch(`${API_BASE_URL}/users/${username}`, { headers });
    if (!userResponse.ok) {
      throw new Error(`User ${username} not found`);
    }
    const userData = await userResponse.json();
    
    // Fetch repos
    const reposResponse = await fetch(`${API_BASE_URL}/users/${username}/repos?per_page=100&sort=updated`, { headers });
    const reposData = await reposResponse.json();
    
    // Fetch activities
    const eventsResponse = await fetch(`${API_BASE_URL}/users/${username}/events?per_page=100`, { headers });
    const eventsData = await eventsResponse.json();
    
    // Get commit stats for this year
    const currentYear = new Date().getFullYear();
    const yearlyCommitStats = await fetchYearlyCommitStats(username, reposData, headers, currentYear);
    
    return {
      ...userData,
      repos: reposData,
      events: eventsData,
      yearlyCommits: yearlyCommitStats
    };
  } catch (error) {
    console.error(`Failed to fetch data for ${username}:`, error);
    throw new Error(`Failed to fetch data for ${username}: ${error.message}`);
  }
};

// Function to fetch commit statistics for the current year
async function fetchYearlyCommitStats(username, repos, headers, year) {
  const startDate = `${year}-01-01T00:00:00Z`;
  const today = new Date();
  const endDate = today.toISOString();
  let totalYearlyCommits = 0;
  let reposWithCommits = 0;
  
  // Only process up to 20 most recently updated repos to avoid rate limits
  const reposToProcess = repos.slice(0, 20);
  
  for (const repo of reposToProcess) {
    try {
      // Skip forks to focus on original contributions
      if (repo.fork) continue;
      
      // Get commits for this repo in the current year
      const commitUrl = `${API_BASE_URL}/repos/${repo.full_name}/commits?author=${username}&since=${startDate}&until=${endDate}&per_page=100`;
      const commitsResponse = await fetch(commitUrl, { headers });
      
      if (!commitsResponse.ok) {
        console.warn(`Skipping repo ${repo.name}: ${commitsResponse.status}`);
        continue;
      }
      
      // Check if we need to handle pagination
      const linkHeader = commitsResponse.headers.get('Link');
      let commitCount = 0;
      
      if (linkHeader && linkHeader.includes('rel="last"')) {
        // Extract the last page number
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          const lastPage = parseInt(lastPageMatch[1]);
          
          // If there are many pages, just use the page count and items per page (100)
          if (lastPage > 5) {
            commitCount = (lastPage - 1) * 100;
            
            // Get the last page to add the remaining commits
            const lastPageUrl = `${commitUrl}&page=${lastPage}`;
            const lastPageResponse = await fetch(lastPageUrl, { headers });
            if (lastPageResponse.ok) {
              const lastPageCommits = await lastPageResponse.json();
              commitCount += lastPageCommits.length;
            }
          } else {
            // If fewer pages, fetch each page
            for (let page = 1; page <= lastPage; page++) {
              const pageUrl = `${commitUrl}&page=${page}`;
              const pageResponse = await fetch(pageUrl, { headers });
              if (pageResponse.ok) {
                const pageCommits = await pageResponse.json();
                commitCount += pageCommits.length;
              }
            }
          }
        }
      } else {
        // No pagination needed
        const commits = await commitsResponse.json();
        commitCount = commits.length;
      }
      
      if (commitCount > 0) {
        totalYearlyCommits += commitCount;
        reposWithCommits++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn(`Error fetching commits for ${repo.name}:`, error);
    }
  }
  
  return {
    totalYearlyCommits,
    reposWithCommits,
    commitsPerRepo: reposWithCommits > 0 ? (totalYearlyCommits / reposWithCommits).toFixed(2) : 0,
    year
  };
}