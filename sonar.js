const SONAR = require('sonarqube-scanner');

SONAR({
    serverUrl: 'https://sonarqube.sw-gis.de',
    token: '23e846b116cd3e27564f512fb88cf1c719caadeb',
    options: {
        'sonar.projectKey': 'molly-dev',
        'sonar.inclusions': 'src/**/*',
        'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',

    }
});