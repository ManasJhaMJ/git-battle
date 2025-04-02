// geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const analyzeProfiles = async (user1Data, user2Data) => {
  try {
    // Process user1 data
    const user1Stats = processUserData(user1Data);
    
    // Process user2 data
    const user2Stats = processUserData(user2Data);
    
    // Generate prompt for Gemini
    const prompt = generateGeminiPrompt(user1Data, user2Data, user1Stats, user2Stats);
    
    // Get Gemini's analysis as plain text
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Extract winner from the text (assuming format includes "Winner: username")
    let winner = determineWinnerFromText(analysisText, user1Data.login, user2Data.login, user1Stats, user2Stats);
    
    return {
      user1: user1Stats,
      user2: user2Stats,
      winner: winner,
      summary: analysisText
    };
  } catch (error) {
    console.error('Error analyzing profiles:', error);
    return {
      user1: processUserData(user1Data),
      user2: processUserData(user2Data),
      winner: calculateWinner(processUserData(user1Data), processUserData(user2Data)),
      summary: "Battle analysis completed! Calculated winner based on GitHub stats. AI analysis failed."
    };
  }
};

// Function to extract winner from text response
const determineWinnerFromText = (text, user1Login, user2Login, user1Stats, user2Stats) => {
  const lowerText = text.toLowerCase();
  
  // Check if text explicitly mentions winner
  if (lowerText.includes(`winner: ${user1Login.toLowerCase()}`)) {
    return user1Login;
  } else if (lowerText.includes(`winner: ${user2Login.toLowerCase()}`)) {
    return user2Login;
  }
  
  // If not explicit, check which username appears more frequently in winner context
  const user1Mentions = (lowerText.match(new RegExp(`\\b${user1Login.toLowerCase()}\\b.*?(win|better|superior|stronger)`, 'g')) || []).length;
  const user2Mentions = (lowerText.match(new RegExp(`\\b${user2Login.toLowerCase()}\\b.*?(win|better|superior|stronger)`, 'g')) || []).length;
  
  if (user1Mentions > user2Mentions) {
    return user1Login;
  } else if (user2Mentions > user1Mentions) {
    return user2Login;
  }
  
  // Fallback to direct comparison of stats if text analysis is inconclusive
  return calculateWinner(user1Stats, user2Stats);
};

const processUserData = (userData) => {
  // Calculate stats from raw GitHub data
  const totalStars = userData.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = userData.repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  // Extract languages
  const languages = {};
  userData.repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  
  const languageArray = Object.keys(languages);
  
  // Use the new yearly commits data instead of event-based commit counting
  const totalCommits = userData.yearlyCommits ? userData.yearlyCommits.totalYearlyCommits : 0;
  const commitsPerRepo = userData.yearlyCommits ? userData.yearlyCommits.commitsPerRepo : 0;
  
  return {
    login: userData.login,
    totalStars,
    totalForks,
    languages: languageArray,
    primaryLanguage: languageArray[0] || 'None',
    totalCommits,
    commitsPerRepo,
    yearlyCommits: userData.yearlyCommits,
    mostStarredRepo: [...userData.repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0],
  };
};

const generateGeminiPrompt = (user1, user2, user1Stats, user2Stats) => {
  return `
    Analyze these two GitHub profiles and determine a winner based on their statistics:
    
    User 1 (${user1.login}):
    - Repos: ${user1.public_repos}
    - Stars: ${user1Stats.totalStars}
    - Forks: ${user1Stats.totalForks}
    - Languages: ${user1Stats.languages.join(', ')}
    - Primary Language: ${user1Stats.primaryLanguage}
    - Latest Commits (Must include in roast) : ${user1Stats.yearlyCommits ? user1Stats.yearlyCommits.year : new Date().getFullYear()} Commits: ${user1Stats.totalCommits}
    - Active Repos with Commits: ${user1Stats.yearlyCommits ? user1Stats.yearlyCommits.reposWithCommits : 'N/A'}
    - Commits Per Active Repo: ${user1Stats.commitsPerRepo}
    - Account Created: ${new Date(user1.created_at).toLocaleDateString()}
    - Followers: ${user1.followers}
    - Bio: ${user1.bio || 'No bio available'} 
    
    User 2 (${user2.login}):
    - Repos: ${user2.public_repos}
    - Stars: ${user2Stats.totalStars}
    - Forks: ${user2Stats.totalForks}
    - Languages: ${user2Stats.languages.join(', ')}
    - Primary Language: ${user2Stats.primaryLanguage}
    - Latest Commits (Must include in roast) : ${user2Stats.yearlyCommits ? user2Stats.yearlyCommits.year : new Date().getFullYear()} Commits: ${user2Stats.totalCommits}
    - Active Repos with Commits: ${user2Stats.yearlyCommits ? user2Stats.yearlyCommits.reposWithCommits : 'N/A'}
    - Commits Per Active Repo: ${user2Stats.commitsPerRepo}
    - Account Created: ${new Date(user2.created_at).toLocaleDateString()}
    - Followers: ${user2.followers}
    - Bio: ${user2.bio || 'No bio available'}
    
    Write a funny, engaging 6-8 lines brutal roast of both GitHub profile, comparing them and clearly stating which one is the winner based on their stats. Include which profile is more consistent, popular, has quality over quantity and contributes more. Number of commits doesn't matter much. The analysis should be entertaining but also insightful. Be sure to clearly state the winner. Make sure to use terms like lmao, L, get better, boso and other brutal derogatory insulting terms.
    Do not use markdown or any other formatting. Just plain text.
    Use emojis as well. Do not use "User 1" or "User 2" in the response. Use their usernames instead.
  `;
};

const calculateWinner = (user1Stats, user2Stats) => {
  // Fallback logic in case Gemini fails
  let user1Points = 0;
  let user2Points = 0;
  
  // Compare stars (weighted more heavily)
  if (user1Stats.totalStars > user2Stats.totalStars) user1Points += 2;
  else if (user2Stats.totalStars > user1Stats.totalStars) user2Points += 2;
  
  // Compare forks
  if (user1Stats.totalForks > user2Stats.totalForks) user1Points++;
  else if (user2Stats.totalForks > user1Stats.totalForks) user2Points++;
  
  // Compare languages
  if (user1Stats.languages.length > user2Stats.languages.length) user1Points++;
  else if (user2Stats.languages.length > user1Stats.languages.length) user2Points++;
  
  // Compare yearly commits
  if (user1Stats.totalCommits > user2Stats.totalCommits) user1Points++;
  else if (user2Stats.totalCommits > user1Stats.totalCommits) user2Points++;
  
  // Compare commits per repo (quality metric)
  if (parseFloat(user1Stats.commitsPerRepo) > parseFloat(user2Stats.commitsPerRepo)) user1Points++;
  else if (parseFloat(user2Stats.commitsPerRepo) > parseFloat(user1Stats.commitsPerRepo)) user2Points++;
  
  return user1Points > user2Points ? user1Stats.login : user2Stats.login;
};