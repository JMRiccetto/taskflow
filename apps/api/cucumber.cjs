module.exports = {
  default: {
    requireModule: ['tsx'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.ts'
    ],
    format: ['progress-bar', 'html:cucumber-report.html'],
    parallel: 0
  }
};