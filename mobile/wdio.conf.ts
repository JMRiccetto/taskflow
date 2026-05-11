import type { Options } from '@wdio/types'

export const config: Options.Testrunner = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true
        }
    },
    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './tests/**/*.test.ts'
    ],
    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 1,
    capabilities: [{
        // Capabilidades para Android local (ajustar según necesidad)
        'platformName': 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // 'appium:app': './app-debug.apk', // TODO: Especificar ruta a tu app
        'appium:appPackage': 'com.wdiodemoapp',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true,
        'appium:newCommandTimeout': 240,
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost', // No aplica mucho para native, pero se deja por defecto
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
