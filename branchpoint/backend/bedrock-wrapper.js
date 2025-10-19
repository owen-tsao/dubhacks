// JavaScript wrapper for TypeScript Bedrock functions
const { execSync } = require('child_process');
const path = require('path');

// Function to call the TypeScript Bedrock function
async function generateFollowUpDecisions(originalDecision, chosenPath, simulationResult) {
  try {
    // Use ts-node to execute the TypeScript function
    const result = execSync(`
      const { generateFollowUpDecisions } = require('ts-node/register')('./functions/utils/bedrock.ts');
      generateFollowUpDecisions('${originalDecision.replace(/'/g, "\\'")}', '${chosenPath.replace(/'/g, "\\'")}', ${JSON.stringify(simulationResult)})
        .then(result => console.log(JSON.stringify(result)))
        .catch(error => { console.error('Error:', error.message); process.exit(1); });
    `, { 
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 30000
    });
    
    return JSON.parse(result.trim());
  } catch (error) {
    console.error('Error calling Bedrock function:', error);
    throw error;
  }
}

module.exports = {
  generateFollowUpDecisions
};
