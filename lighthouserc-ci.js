module.exports = {
    ci: {
      collect: {
        numberOfRuns: 3,
        startServerCommand: 'yarn start',
        url: ['http://localhost:3000/'],
      },
         assert: {
          preset:  "lighthouse:no-pwa",
            assertions: {
              'categories:performance': ['error', {minScore: .9}],
              'categories:accessibility': ['error', {minScore: .9}],
              'categories:best-practices': ['error', {minScore: .9}],
              'categories:seo': ['error', {minScore: .9}],
              'categories:pwa': 'off',
            },  
        },
        upload: {
          target: 'temporary-public-storage',
      },
    },
  };