const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withFmtFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let content = fs.readFileSync(podfilePath, 'utf8');
        
        const targetPattern = /post_install do \|installer\|/g;
        
        // Aggressive fix: Define FMT_USE_CONSTEVAL=0 for EVERY target in the pods project
        // and force C++17. This is the "sledgehammer" fix for Xcode 16 + RN 0.81.
        const patch = `
    post_install do |installer|
      installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
`;

        if (content.includes('post_install do |installer|')) {
           if (!content.includes("FMT_USE_CONSTEVAL=0")) {
              console.log('Applying global FMT_USE_CONSTEVAL=0 patch to Podfile...');
              // Replace the start of the existing post_install block
              content = content.replace(targetPattern, patch);
              fs.writeFileSync(podfilePath, content);
           }
        }
      }
      return config;
    },
  ]);
};

module.exports = withFmtFix;
